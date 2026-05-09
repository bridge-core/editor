import { Component, Ref, ref, watch } from 'vue'
import TreeEditorTabComponent from './TreeEditorTab.vue'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { FileTab } from '@/components/TabSystem/FileTab'
import { Disposable, disposeAll } from '@/libs/disposeable/Disposeable'
import {
	AddElementEdit,
	AddPropertyEdit,
	ArrayElement,
	buildTree,
	DeleteElementEdit,
	ModifyPropertyKeyEdit,
	ModifyValueEdit,
	ObjectElement,
	ParentElements,
	ReplaceEdit,
	TreeEdit,
	TreeElements,
	TreeSelection,
	ValueElement,
} from './Tree'
import { CompletionItem, createSchema, Diagnostic } from '@/libs/jsonSchema/Schema'
import { Settings } from '@/libs/settings/Settings'
import * as JSONC from 'jsonc-parser'
import { interupt } from '@/libs/Interupt'
import { TabManager } from '@/components/TabSystem/TabManager'
import { viewDocumentation } from '@/libs/Documentation'

export class TreeEditorTab extends FileTab {
	public component: Component | null = TreeEditorTabComponent
	public icon = ref('loading')
	public language = ref('plaintext')
	public hasDocumentation = ref(false)

	public tree: Ref<TreeElements> = ref(new ObjectElement(null))

	private fileCache: string | null = null

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
		if (Settings.get('jsonEditor') !== 'tree') return false

		return path.endsWith('.json')
	}

	public static editPriority(path: string): number {
		return 1
	}

	public is(path: string) {
		return path === this.path
	}

	public static setup() {
		Settings.addSetting('bridgePredictions', {
			default: true,
		})

		Settings.addSetting('inlineDiagnostics', {
			default: true,
		})

		Settings.addSetting('automaticallyOpenTreeNodes', {
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

		this.disposables.push(
			fileSystem.pathUpdated.on(async (path) => {
				if (!path) return
				if (path !== this.path) return

				if (!(await fileSystem.exists(path))) {
					await TabManager.removeTab(this)
				} else if (!this.modified.value) {
					const fileContent = await fileSystem.readFileText(this.path)

					if (this.fileCache === fileContent) return

					this.fileCache = fileContent

					try {
						this.tree.value = buildTree(JSONC.parse(fileContent))
					} catch {}
				}
			})
		)

		const fileTypeData = ProjectManager.currentProject.fileTypeData

		this.fileType = fileTypeData.get(this.path)

		if (this.fileType !== null) {
			this.hasDocumentation.value = this.fileType.documentation !== undefined

			if (this.fileType.icon !== undefined) this.fileTypeIcon = this.fileType.icon
		}

		const fileContent = await fileSystem.readFileText(this.path)

		this.fileCache = fileContent

		try {
			this.tree.value = buildTree(JSONC.parse(fileContent))
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

		this.disposables.push(
			Settings.updated.on((event: { id: string; value: any } | undefined) => {
				if (!event) return

				if (event.id === 'inlineDiagnostics') this.validate()
			})
		)
	}

	public async destroy() {
		disposeAll(this.disposables)

		this.interruptAutoSave.dispose()
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

		const content = JSON.stringify(this.tree.value.toJson(), null, 2)

		this.fileCache = content

		await fileSystem.writeFile(this.path, content)

		this.icon.value = this.fileTypeIcon
	}

	public async saveAs(savePath: string) {
		this.modified.value = false
		this.icon.value = 'loading'

		await fileSystem.writeFile(savePath, JSON.stringify(this.tree.value.toJson(), null, 2))
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

		if (this.currentEditIndex !== this.history.length - 1) this.history = this.history.slice(0, this.currentEditIndex + 1)

		this.history.push(edit)
		this.currentEditIndex++

		this.selectedTree.value = edit.apply()

		this.validate()
		this.updateCompletions()

		if (Settings.get('autoSaveChanges')) {
			this.interruptAutoSave.invoke()
		}
	}

	public async copy() {
		const treeSelection = this.contextTree.value ?? this.selectedTree.value

		if (!treeSelection) return

		let json = treeSelection.tree.toJson()

		if (treeSelection.type === 'property') {
			const newObject: any = {}
			newObject[treeSelection.tree.key as string] = json

			json = newObject
		}

		const content = JSON.stringify(json, null, 2)

		const clipboardItem = new ClipboardItem({
			['text/plain']: content,
		})

		await navigator.clipboard.write([clipboardItem])
	}

	public async cut() {
		const treeSelection = this.contextTree.value ?? this.selectedTree.value

		if (!treeSelection) return

		let json = treeSelection.tree.toJson()

		if (treeSelection.type === 'property') {
			const newObject: any = {}
			newObject[treeSelection.tree.key as string] = json

			json = newObject
		}

		const content = JSON.stringify(json, null, 2)

		const clipboardItem = new ClipboardItem({
			['text/plain']: content,
		})

		await navigator.clipboard.write([clipboardItem])

		this.edit(new DeleteElementEdit(treeSelection.tree))
	}

	private convertToMatchingType(value: string, types: string[]): any {
		if (types.includes('number') || (types.includes('integer') && /^-?([0-9]*[.])?[0-9]+$/.test(value))) {
			return parseFloat(value)
		}

		if (types.includes('boolean')) {
			if (value === 'true') return true

			if (value === 'false') return false
		}

		return value
	}

	private addTree(treeSelection: TreeSelection, value: string) {
		if (treeSelection === null) return

		if (treeSelection.tree instanceof ObjectElement) {
			let addValue: TreeElements = new ObjectElement(treeSelection.tree, value)

			if (Settings.get('bridgePredictions')) {
				const path = this.getTreeSchemaPath(treeSelection.tree) + value + '/'
				const types = this.getTypes(path)
				if (types[0] === 'number') {
					addValue = new ValueElement(treeSelection.tree, value, 1)
				} else if (types[0] === 'string') {
					addValue = new ValueElement(treeSelection.tree, value, '')
				} else if (types[0] === 'integer') {
					addValue = new ValueElement(treeSelection.tree, value, 1)
				} else if (types[0] === 'boolean') {
					addValue = new ValueElement(treeSelection.tree, value, true)
				} else if (types[0] === 'array') {
					addValue = new ArrayElement(treeSelection.tree, value)
				}
			}

			this.edit(new AddPropertyEdit(treeSelection.tree, value, addValue))
		}

		if (treeSelection.tree instanceof ArrayElement) {
			let elementValue = value

			// TODO: If adding an object with a property with the same name as value is valid, add that instead
			if (Settings.get('bridgePredictions')) {
				const path = this.getTreeSchemaPath(treeSelection.tree) + 'any_index/'
				const types = this.getTypes(path)

				elementValue = this.convertToMatchingType(value, types)
			}

			this.edit(
				new AddElementEdit(
					treeSelection.tree,
					new ValueElement(treeSelection.tree, treeSelection.tree.children.length, elementValue)
				)
			)
		}
	}

	private editTree(treeSelection: TreeSelection, value: string) {
		if (treeSelection === null) return

		if (treeSelection.type === 'property') {
			this.edit(new ModifyPropertyKeyEdit(treeSelection.tree.parent as ObjectElement, treeSelection.tree.key as string, value))

			return
		} else {
			if (treeSelection.tree instanceof ValueElement) {
				let elementValue = value

				if (Settings.get('bridgePredictions')) {
					const path = this.getTreeSchemaPath(treeSelection.tree)
					const types = this.getTypes(path)

					elementValue = this.convertToMatchingType(value, types)
				}

				this.edit(new ModifyValueEdit(treeSelection.tree, elementValue))

				return
			}
		}
	}

	public async paste() {
		const clipboardItems = await navigator.clipboard.read()

		const textItem = clipboardItems.find((item) => item.types.includes('text/plain'))

		if (!textItem) return

		const text = await (await textItem.getType('text/plain')).text()

		let json = null

		try {
			json = JSONC.parse(text)
		} catch {}

		const treeSelection = this.contextTree.value ?? this.selectedTree.value

		if (!treeSelection) return

		if (json) {
			const insertElement = buildTree(json)

			if (treeSelection.type === 'value') {
				this.edit(new ReplaceEdit(treeSelection.tree, insertElement, () => {}))
			} else {
				if (!(insertElement instanceof ObjectElement)) return

				if (treeSelection.tree instanceof ObjectElement) {
					for (const key of Object.keys(insertElement.children)) {
						const childElement = buildTree(json[key], treeSelection.tree)
						childElement.key = key
						this.edit(new AddPropertyEdit(treeSelection.tree, key, childElement))
					}
				} else if (treeSelection.tree instanceof ArrayElement) {
					insertElement.key = treeSelection.tree.children.length
					this.edit(new AddElementEdit(treeSelection.tree, insertElement))
				}
			}

			return
		}

		if (treeSelection.type === 'value') {
			this.editTree(treeSelection, text)
		} else {
			this.addTree(treeSelection, text)
		}
	}

	public undo() {
		if (this.currentEditIndex < 0) return

		this.modified.value = true

		this.selectedTree.value = this.history[this.currentEditIndex].undo()

		this.currentEditIndex--

		this.validate()
		this.updateCompletions()

		if (Settings.get('autoSaveChanges')) {
			this.interruptAutoSave.invoke()
		}
	}

	public redo() {
		if (this.currentEditIndex >= this.history.length - 1) return

		this.modified.value = true

		this.currentEditIndex++

		this.selectedTree.value = this.history[this.currentEditIndex].apply()

		this.validate()
		this.updateCompletions()

		if (Settings.get('autoSaveChanges')) {
			this.interruptAutoSave.invoke()
		}
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

		if (!schemas) return []

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

		if (!Settings.get('inlineDiagnostics')) {
			return (this.diagnostics.value = [])
		}

		const schemaData = ProjectManager.currentProject.schemaData

		const schemas = schemaData.getSchemasForFile(this.path)

		if (!schemas) return

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

		if (!schemas) return

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

	private getNextQuote(line: string) {
		for (let i = -1; i < line.length; i++) {
			if (line[i] === '"') return i
		}
		return line.length
	}

	private getPreviousQuote(line: string) {
		for (let i = -2; i > 0; i--) {
			if (line[i] === '"') return i + 1
		}
		return 0
	}

	public async viewDocumentation() {
		const tree = this.contextTree.value?.tree ?? this.selectedTree.value?.tree

		if (!tree) return

		if (!this.fileType.documentation) return

		const text = JSON.stringify(tree.toJson())

		const wordStart = this.getPreviousQuote(text)
		const wordEnd = this.getNextQuote(text)

		const word = text.substring(wordStart, wordEnd)

		if (!word) return

		await viewDocumentation(this.fileType, word)
	}

	private interruptAutoSave = interupt(() => {
		this.save()
	}, 1000)
}
