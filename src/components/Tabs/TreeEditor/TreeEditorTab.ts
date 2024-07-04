import { Component, computed, ComputedRef, Ref, ref } from 'vue'
import TreeEditorTabComponent from './TreeEditorTab.vue'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { FileTab } from '@/components/TabSystem/FileTab'
import { Disposable, disposeAll } from '@/libs/disposeable/Disposeable'
import { buildTree, ObjectElement, TreeElement } from './Tree'

export class TreeEditorTab extends FileTab {
	public component: Component | null = TreeEditorTabComponent
	public icon = ref('loading')
	public language = ref('plaintext')
	public hasDocumentation = ref(false)

	public tree: TreeElement = new ObjectElement(null)

	public selectedTree: Ref<{ tree: TreeElement; key?: string | number } | null> = ref(null)

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
			this.tree = buildTree(JSON.parse(fileContent))
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

		this.icon.value = this.fileTypeIcon
	}

	public select(tree: TreeElement, key?: string | number) {
		this.selectedTree.value = { key, tree }
	}

	public useIsSelected(tree: TreeElement, key?: string | number): ComputedRef<boolean> {
		//Proxies don't equal eachother so we use an uuid
		return computed(() => this.selectedTree.value?.tree.id === tree.id && this.selectedTree.value?.key === key)
	}
}
