import { Component, computed, ComputedRef, Ref, ref } from 'vue'
import TreeEditorTabComponent from './TreeEditorTab.vue'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { FileTab } from '@/components/TabSystem/FileTab'
import { Disposable, disposeAll } from '@/libs/disposeable/Disposeable'
import { buildTree, ObjectElement, TreeEdit, TreeElement, TreeSelection } from './Tree'

export class TreeEditorTab extends FileTab {
	public component: Component | null = TreeEditorTabComponent
	public icon = ref('loading')
	public language = ref('plaintext')
	public hasDocumentation = ref(false)

	public tree: Ref<TreeElement> = ref(new ObjectElement(null))

	public history: TreeEdit[] = []
	public currentEditIndex = -1

	public selectedTree: Ref<TreeSelection> = ref(null)

	public knownWords: Record<string, string[]> = {
		keywords: [],
		typeIdentifiers: [],
		variables: [],
		definitions: [],
	}

	private fileTypeIcon: string = 'data_object'

	private fileType: any | null = null

	private disposables: Disposable[] = []

	public static canEdit(path: string): boolean {
		return path.endsWith('.json')
	}

	public is(path: string) {
		return path === this.path
	}

	public static setup() {}

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
		this.icon.value = 'loading'

		await fileSystem.writeFile(this.path, JSON.stringify(this.tree.value.toJson(), null, 2))

		this.icon.value = this.fileTypeIcon
	}

	public select(tree: TreeElement, key?: string | number) {
		this.selectedTree.value = { key, tree }
	}

	public edit(edit: TreeEdit) {
		if (this.currentEditIndex !== this.history.length - 1)
			this.history = this.history.slice(0, this.currentEditIndex + 1)

		this.history.push(edit)
		this.currentEditIndex++

		this.selectedTree.value = edit.apply()
	}

	public undo() {
		if (this.currentEditIndex < 0) return

		this.selectedTree.value = this.history[this.currentEditIndex].undo()

		this.currentEditIndex--
	}

	public redo() {
		if (this.currentEditIndex >= this.history.length - 1) return

		this.currentEditIndex++

		this.selectedTree.value = this.history[this.currentEditIndex].apply()
	}
}
