import { App } from '/@/App'
import { TabSystem } from '/@/components/TabSystem/TabSystem'
import Vue from 'vue'
import { IPackType, TPackTypeId } from '/@/components/Data/PackType'
import { ProjectConfig, IConfigJson } from '../ProjectConfig'
import { RecentFiles } from '../RecentFiles'
import { loadIcon } from './loadIcon'
import { loadPacks } from './loadPacks'
import { PackIndexer } from '/@/components/PackIndexer/PackIndexer'
import { ProjectManager } from '../ProjectManager'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { CompilerManager } from '/@/components/Compiler/CompilerManager'
import { JsonDefaults } from '/@/components/Data/JSONDefaults'
import { TypeLoader } from '/@/components/Data/TypeLoader'
import { ExtensionLoader } from '/@/components/Extensions/ExtensionLoader'
import { FileChangeRegistry } from './FileChangeRegistry'
import { FileTab } from '/@/components/TabSystem/FileTab'
import { TabActionProvider } from '/@/components/TabSystem/TabActions/Provider'

export interface IProjectData extends IConfigJson {
	path: string
	name: string
	imgSrc: string
	contains: IPackType[]
}

export abstract class Project {
	public readonly recentFiles!: RecentFiles
	public readonly tabSystems = [new TabSystem(this), new TabSystem(this, 1)]
	protected _projectData!: Partial<IProjectData>
	// Not directly assigned so they're not responsive
	public readonly packIndexer: PackIndexer
	protected _fileSystem: FileSystem
	public readonly compilerManager = new CompilerManager(this)
	public readonly jsonDefaults = new JsonDefaults(this)
	protected typeLoader = new TypeLoader(this.app.fileSystem)
	public readonly config: ProjectConfig
	public readonly extensionLoader = new ExtensionLoader(
		this.app.fileSystem,
		`projects/${this.name}/.bridge/inactiveExtensions.json`
	)
	public readonly fileChange = new FileChangeRegistry()
	public readonly fileSave = new FileChangeRegistry()
	public readonly tabActionProvider = new TabActionProvider()

	//#region Getters
	get projectData() {
		return this._projectData
	}
	get name() {
		return this.baseDirectory.name
	}
	get tabSystem() {
		if (this.tabSystems[0].isActive) return this.tabSystems[0]
		if (this.tabSystems[1].isActive) return this.tabSystems[1]
	}
	get inactiveTabSystem() {
		if (!this.tabSystems[0].isActive) return this.tabSystems[0]
		if (!this.tabSystems[1].isActive) return this.tabSystems[1]
	}
	get baseDirectory() {
		return this._baseDirectory
	}
	get fileSystem() {
		return this._fileSystem
	}
	get isActiveProject() {
		return this.name === this.parent.selectedProject
	}
	//#endregion

	constructor(
		protected parent: ProjectManager,
		public readonly app: App,
		protected _baseDirectory: FileSystemDirectoryHandle
	) {
		this._fileSystem = new FileSystem(_baseDirectory)
		this.config = new ProjectConfig(this._fileSystem)
		this.packIndexer = new PackIndexer(app, _baseDirectory)
		Vue.set(
			this,
			'recentFiles',
			new RecentFiles(
				app,
				`projects/${this.name}/.bridge/recentFiles.json`
			)
		)

		this.onCreate()
	}

	abstract onCreate(): Promise<void> | void

	async activate(isReload = false) {
		this.parent.title.setProject(this.name)
		if (!isReload) {
			for (const tabSystem of this.tabSystems) await tabSystem.activate()
		}

		await this.extensionLoader.loadExtensions(
			await this.fileSystem.getDirectoryHandle('.bridge/extensions', {
				create: true,
			})
		)

		const selectedTab = this.tabSystem?.selectedTab
		this.typeLoader.activate(
			selectedTab instanceof FileTab
				? selectedTab.getProjectPath()
				: undefined
		)

		await this.packIndexer.activate(isReload).then(() => {
			this.jsonDefaults.activate()
			this.compilerManager.start('default.json', 'dev')
		})
	}
	deactivate(isReload = false) {
		if (!isReload)
			this.tabSystems.forEach((tabSystem) => tabSystem.deactivate())

		this.typeLoader.deactivate()
		this.packIndexer.deactivate()
		this.compilerManager.deactivate()
		this.jsonDefaults.deactivate()
		this.extensionLoader.disposeAll()
	}
	disposeWorkers() {
		this.packIndexer.dispose()
		this.compilerManager.dispose()
	}
	dispose() {
		this.disposeWorkers()
		this.tabSystems.forEach((tabSystem) => tabSystem.dispose())
		this.extensionLoader.disposeAll()
	}

	async refresh() {
		this.deactivate(true)
		this.disposeWorkers()
		await this.activate(true)
	}

	async openFile(fileHandle: FileSystemFileHandle, selectTab = true) {
		for (const tabSystem of this.tabSystems) {
			const tab = await tabSystem.getTab(fileHandle)
			if (tab) return selectTab ? tabSystem.select(tab) : undefined
		}

		this.tabSystem?.open(fileHandle, selectTab)
	}
	async closeFile(fileHandle: FileSystemFileHandle) {
		for (const tabSystem of this.tabSystems) {
			const tabToClose = await tabSystem.getTab(fileHandle)
			tabToClose?.close()
		}
	}
	async getFileTab(fileHandle: FileSystemFileHandle) {
		for (const tabSystem of this.tabSystems) {
			const tab = await tabSystem.getTab(fileHandle)
			if (tab !== undefined) return tab
		}
	}

	absolutePath(filePath: string) {
		return `projects/${this.name}/${filePath}`
	}
	getProjectPath(fileHandle: FileSystemFileHandle) {
		return this.baseDirectory
			.resolve(fileHandle)
			.then((path) => path?.join('/'))
	}

	async updateFile(filePath: string) {
		// We already have a check for foreign files inside of the TabSystem.save(...) function
		// but there are a lot of sources that call updateFile(...)
		try {
			await this.fileSystem.getFileHandle(filePath)
		} catch {
			// This is a foreign file, don't process it
			return
		}

		await Promise.all([
			this.packIndexer.updateFile(filePath),
			this.compilerManager.updateFiles('default.json', [filePath]),
		])
		await this.jsonDefaults.updateDynamicSchemas(filePath)
	}
	async updateFiles(filePaths: string[]) {
		await Promise.all([
			this.packIndexer.updateFiles(filePaths),
			this.compilerManager.updateFiles('default.json', filePaths),
		])

		await this.jsonDefaults.updateMultipleDynamicSchemas(filePaths)
	}

	async getFileFromDiskOrTab(filePath: string) {
		const fileHandle = await this.fileSystem.getFileHandle(filePath)
		const tab = await this.getFileTab(fileHandle)
		if (tab && tab instanceof FileTab) return await tab.getFile()

		return await fileHandle.getFile()
	}
	setActiveTabSystem(tabSystem: TabSystem, value: boolean) {
		this.tabSystems.forEach((tS) =>
			tabSystem !== tS ? tS.setActive(value, false) : undefined
		)
	}

	hasPacks(packTypes: TPackTypeId[]) {
		for (const packType of packTypes) {
			if (!this._projectData.contains?.some(({ id }) => id === packType))
				return false
		}
		return true
	}

	async loadProject() {
		await this.config.setup()

		Vue.set(this, '_projectData', {
			...this.config.get(),
			path: this.name,
			name: this.name,
			imgSrc: await loadIcon(
				`projects/${this.name}`,
				this.app.fileSystem
			),
			contains: [],
		})
		loadPacks(this.app, this.name).then((packs) =>
			Vue.set(this._projectData, 'contains', packs)
		)
	}

	async recompile(forceStartIfActive = true) {
		if (forceStartIfActive) this.compilerManager.dispose()

		if (forceStartIfActive && this.isActiveProject) {
			this.compilerManager.start('default.json', 'dev', true)
		} else {
			await this.fileSystem.writeFile('.bridge/.restartDevServer', '')
		}
	}
}
