import { Component, Ref, ref, watch } from 'vue'
import TreeEditorTabComponent from './TreeEditorTab.vue'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { FileTab } from '@/components/TabSystem/FileTab'
import { Disposable, disposeAll } from '@/libs/disposeable/Disposeable'
import { buildTree, ObjectElement, ParentElements, TreeEdit, TreeElements, TreeSelection } from './Tree'
import { CompletionItem, createSchema, Diagnostic } from '@/libs/jsonSchema/Schema'
import { Settings } from '@/libs/settings/Settings'

export class TreeEditorTab extends FileTab {
	public component: Component | null = TreeEditorTabComponent
	public icon = ref('loading')
	public language = ref('plaintext')
	public hasDocumentation = ref(false)

	public tree: Ref<TreeElements> = ref(new ObjectElement(null))

	public history: TreeEdit[] = []
	public currentEditIndex = -1

	public selectedTree: Ref<TreeSelection> = ref(null)
	public draggedTree: Ref<TreeSelection> = ref(null)
	public contextTree: Ref<TreeSelection> = ref(null)

	public knownWords: Record<string, string[]> = {
		keywords: [],
		typeIdentifiers: [],
		variables: [],
		definitions: [],
	}

	public diagnostics: Ref<Diagnostic[]> = ref([])
	public completions: Ref<CompletionItem[]> = ref([])
	public parentCompletions: Ref<CompletionItem[]> = ref([])

	private fileTypeIcon: string = 'data_object'

	private fileType: any | null = null

	private disposables: Disposable[] = []

	public static canEdit(path: string): boolean {
		return path.endsWith('.json')
	}

	public is(path: string) {
		return path === this.path
	}

	public static setup() {
		Settings.addSetting('showTreeEditorLocationBar', {
			default: true,
		})

		Settings.addSetting('bridgePredictions', {
			default: true,
		})

		Settings.addSetting('inlineDiagnostics', {
			default: true,
		})

		Settings.addSetting('autoOpenTreeNodes', {
			default: true,
		})

		Settings.addSetting('dragAndDropTreeNodes', {
			default: true,
		})

		Settings.addSetting('showArrayIndices', {
			default: false,
		})

		Settings.addSetting('hideBrackets', {
			default: false,
		})
	}

	public async create() {
		if (!ProjectManager.currentProject) return
		if (!(ProjectManager.currentProject instanceof BedrockProject)) return

		const fileTypeData = ProjectManager.currentProject.fileTypeData

		this.fileType = fileTypeData.get(this.path)

		if (this.fileType !== null) {
			this.hasDocumentation.value = this.fileType.documentation !== undefined

			if (this.fileType.icon !== undefined) this.fileTypeIcon = this.fileType.icon
		}

		const fileContent = await fileSystem.readFileText(this.path)

		try {
			this.tree.value = buildTree(JSON.parse(fileContent))
		} catch {}

		const schemaData = ProjectManager.currentProject.schemaData

		await schemaData.updateSchemaForFile(this.path, this.fileType?.id, this.fileType?.schema)

		this.icon.value = this.fileTypeIcon

		let keywords: string[] = ['minecraft', 'bridge', ProjectManager.currentProject?.config?.namespace].filter(
			(item) => item !== undefined
		) as string[]
		let typeIdentifiers: string[] = []
		let variables: string[] = []
		let definitions: string[] = []

		if (this.fileType && this.fileType.highlighterConfiguration) {
			keywords = [...keywords, ...(this.fileType.highlighterConfiguration.keywords ?? [])]
			typeIdentifiers = this.fileType.highlighterConfiguration.typeIdentifiers ?? []
			variables = this.fileType.highlighterConfiguration.variables ?? []
			definitions = this.fileType.highlighterConfiguration.definitions ?? []
		}

		this.knownWords = {
			keywords,
			typeIdentifiers,
			variables,
			definitions,
		}

		this.disposables.push(
			schemaData.updated.on((path) => {
				if (path !== this.path) return

				this.validate()
				this.updateCompletions()
			})
		)

		watch(this.selectedTree, () => {
			this.updateCompletions()
		})
	}

	public async destroy() {
		disposeAll(this.disposables)
	}

	public async activate() {
		if (!ProjectManager.currentProject) return
		if (!(ProjectManager.currentProject instanceof BedrockProject)) return

		const schemaData = ProjectManager.currentProject.schemaData

		schemaData.addFileForUpdate(this.path, this.fileType?.id, this.fileType?.schema)

		await schemaData.updateSchemaForFile(this.path, this.fileType?.id, this.fileType?.schema)
	}

	public async deactivate() {
		if (!ProjectManager.currentProject) return
		if (!(ProjectManager.currentProject instanceof BedrockProject)) return

		const schemaData = ProjectManager.currentProject.schemaData

		schemaData.removeFileForUpdate(this.path)
	}

	public async save() {
		this.modified.value = false
		this.icon.value = 'loading'

		await fileSystem.writeFile(this.path, JSON.stringify(this.tree.value.toJson(), null, 2))

		this.icon.value = this.fileTypeIcon
	}

	public select(tree: TreeElements) {
		this.selectedTree.value = { type: 'value', tree }
	}

	public selectProperty(tree: TreeElements) {
		this.selectedTree.value = { type: 'property', tree }
	}

	public drag(tree: TreeElements) {
		this.draggedTree.value = { type: 'property', tree }
	}

	public cancelDrag() {
		this.draggedTree.value = null
	}

	public edit(edit: TreeEdit) {
		this.modified.value = true

		if (this.currentEditIndex !== this.history.length - 1)
			this.history = this.history.slice(0, this.currentEditIndex + 1)

		this.history.push(edit)
		this.currentEditIndex++

		this.selectedTree.value = edit.apply()

		this.validate()
		this.updateCompletions()
	}

	public undo() {
		if (this.currentEditIndex < 0) return

		this.modified.value = true

		this.selectedTree.value = this.history[this.currentEditIndex].undo()

		this.currentEditIndex--

		this.validate()
		this.updateCompletions()
	}

	public redo() {
		if (this.currentEditIndex >= this.history.length - 1) return

		this.modified.value = true

		this.currentEditIndex++

		this.selectedTree.value = this.history[this.currentEditIndex].apply()

		this.validate()
		this.updateCompletions()
	}

	public getTreeSchemaPath(tree: TreeElements): string {
		let path = '/'

		let parents = []
		let currentElement: ParentElements | TreeElements = tree

		while (currentElement?.parent) {
			parents.push(currentElement)

			currentElement = currentElement.parent
		}

		parents.reverse()

		for (const element of parents) {
			if (typeof element.key !== 'string') {
				path += 'any_index/'

				continue
			}

			path += element.key?.toString() + '/'
		}

		return path
	}

	public getTreeParentSchemaPath(tree: TreeElements): string {
		let path = '/'

		let parents = []
		let currentElement: ParentElements | TreeElements = tree

		while (currentElement?.parent) {
			parents.push(currentElement)

			currentElement = currentElement.parent
		}

		parents.reverse()

		for (const element of parents.slice(0, -1)) {
			if (typeof element.key !== 'string') {
				path += 'any_index/'

				continue
			}

			path += element.key?.toString() + '/'
		}

		return path
	}

	public getTypes(path: string): string[] {
		if (!ProjectManager.currentProject) return []
		if (!(ProjectManager.currentProject instanceof BedrockProject)) return []

		const schemaData = ProjectManager.currentProject.schemaData

		const schemas = schemaData.getSchemasForFile(this.path)
		const schema = schemas.localSchemas[schemas.main]

		const filePath = this.path

		console.time('Get Types')

		const valueSchema = createSchema(schema, (path: string) => schemaData.getSchemaForFile(filePath, path))

		const types = valueSchema.getTypes(this.tree.value.toJson(), path)

		console.timeEnd('Get Types')

		return types
	}

	private validate() {
		if (!ProjectManager.currentProject) return
		if (!(ProjectManager.currentProject instanceof BedrockProject)) return

		const schemaData = ProjectManager.currentProject.schemaData

		const schemas = schemaData.getSchemasForFile(this.path)
		const schema = schemas.localSchemas[schemas.main]

		const filePath = this.path

		console.time('Validate')

		const valueSchema = createSchema(schema, (path: string) => schemaData.getSchemaForFile(filePath, path))

		this.diagnostics.value = valueSchema.validate(this.tree.value.toJson())

		console.timeEnd('Validate')
	}

	private updateCompletions() {
		if (!ProjectManager.currentProject) return
		if (!(ProjectManager.currentProject instanceof BedrockProject)) return

		if (!this.selectedTree.value) {
			this.completions.value = []

			return
		}

		const schemaData = ProjectManager.currentProject.schemaData

		const schemas = schemaData.getSchemasForFile(this.path)
		const schema = schemas.localSchemas[schemas.main]

		const filePath = this.path

		console.time('Completions')

		const valueSchema = createSchema(schema, (path: string) => schemaData.getSchemaForFile(filePath, path))

		let path = this.getTreeSchemaPath(this.selectedTree.value.tree)
		let parentPath = this.getTreeParentSchemaPath(this.selectedTree.value.tree)

		this.completions.value = valueSchema.getCompletionItems(this.tree.value.toJson(), path)
		this.parentCompletions.value = valueSchema.getCompletionItems(this.tree.value.toJson(), parentPath)

		console.timeEnd('Completions')
	}
}
