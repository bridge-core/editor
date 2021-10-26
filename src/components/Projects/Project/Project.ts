import { App } from '/@/App'
import { IOpenTabOptions, TabSystem } from '/@/components/TabSystem/TabSystem'
import { IPackType, TPackTypeId } from '/@/components/Data/PackType'
import { ProjectConfig, IConfigJson } from './Config'
import { RecentFiles } from '../RecentFiles'
import { loadIcon } from './loadIcon'
import { IPackData, loadPacks } from './loadPacks'
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
import {
	AnyDirectoryHandle,
	AnyFileHandle,
} from '/@/components/FileSystem/Types'
import { markRaw, reactive, set } from '@vue/composition-api'
import { SnippetLoader } from '/@/components/Snippets/Loader'
import { ExportProvider } from '../Export/Extensions/Provider'
import { Tab } from '/@/components/TabSystem/CommonTab'
import { getFolderDifference } from '/@/components/TabSystem/Util/FolderDifference'
import { FileTypeLibrary } from '../../Data/FileType'

export interface IProjectData extends IConfigJson {
	path: string
	name: string
	imgSrc: string
	contains: IPackData[]
}

export abstract class Project {
	public readonly recentFiles!: RecentFiles
	public readonly tabSystems: readonly [TabSystem, TabSystem]
	protected _projectData!: Partial<IProjectData>
	// Not directly assigned so they're not responsive
	public readonly packIndexer: PackIndexer
	protected _fileSystem: FileSystem
	public readonly compilerManager = new CompilerManager(this)
	public readonly jsonDefaults = markRaw(new JsonDefaults(this))
	protected typeLoader: TypeLoader

	public readonly config: ProjectConfig
	public readonly fileTypeLibrary: FileTypeLibrary
	public readonly extensionLoader: ExtensionLoader
	public readonly fileChange = new FileChangeRegistry()
	public readonly fileSave = new FileChangeRegistry()
	public readonly tabActionProvider = new TabActionProvider()
	public readonly snippetLoader = new SnippetLoader(this)
	public readonly exportProvider = new ExportProvider()

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
		protected _baseDirectory: AnyDirectoryHandle
	) {
		this._fileSystem = markRaw(new FileSystem(_baseDirectory))
		this.config = new ProjectConfig(this._fileSystem, this)
		this.fileTypeLibrary = new FileTypeLibrary(this.config)
		this.packIndexer = new PackIndexer(this, _baseDirectory)
		this.extensionLoader = new ExtensionLoader(
			app.fileSystem,
			`projects/${this.name}/.bridge/extensions`,
			`projects/${this.name}/.bridge/inactiveExtensions.json`
		)
		this.typeLoader = new TypeLoader(this.app.dataLoader)

		this.recentFiles = <RecentFiles>(
			reactive(
				new RecentFiles(
					app,
					`projects/${this.name}/.bridge/recentFiles.json`
				)
			)
		)

		this.fileChange.any.on((data) =>
			App.eventSystem.dispatch('fileChange', data)
		)
		this.fileSave.any.on((data) =>
			App.eventSystem.dispatch('fileSave', data)
		)

		this.tabSystems = <const>[new TabSystem(this), new TabSystem(this, 1)]

		setTimeout(() => this.onCreate(), 0)
	}

	abstract onCreate(): Promise<void> | void

	async activate(isReload = false) {
		App.fileType.setProjectConfig(this.config)
		this.parent.title.setProject(this.name)
		this.parent.activatedProject.dispatch(this)

		await this.fileTypeLibrary.setup(this.app.dataLoader)

		if (!isReload) {
			for (const tabSystem of this.tabSystems) await tabSystem.activate()
		}

		await this.extensionLoader.loadExtensions()

		const selectedTab = this.tabSystem?.selectedTab
		this.typeLoader.activate(
			selectedTab instanceof FileTab ? selectedTab.getPath() : undefined
		)

		await this.packIndexer.activate(isReload)

		await Promise.all([
			this.jsonDefaults.activate(),
			this.compilerManager.start('default', 'dev'),
		])

		this.snippetLoader.activate()
	}
	deactivate(isReload = false) {
		if (!isReload)
			this.tabSystems.forEach((tabSystem) => tabSystem.deactivate())

		this.typeLoader.deactivate()
		this.packIndexer.deactivate()
		this.compilerManager.deactivate()
		this.jsonDefaults.deactivate()
		this.extensionLoader.disposeAll()
		this.snippetLoader.deactivate()
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
		this.app.packExplorer.refresh()
		this.deactivate(true)
		this.disposeWorkers()
		await this.activate(true)
	}

	async openFile(fileHandle: AnyFileHandle, options: IOpenTabOptions = {}) {
		for (const tabSystem of this.tabSystems) {
			const tab = await tabSystem.getTab(fileHandle)
			if (tab)
				return options.selectTab ?? true
					? tabSystem.select(tab)
					: undefined
		}

		this.tabSystem?.open(fileHandle, options)
	}
	async closeFile(fileHandle: AnyFileHandle) {
		for (const tabSystem of this.tabSystems) {
			const tabToClose = await tabSystem.getTab(fileHandle)
			tabToClose?.close()
		}
	}
	async getFileTab(fileHandle: AnyFileHandle) {
		for (const tabSystem of this.tabSystems) {
			const tab = await tabSystem.getTab(fileHandle)
			if (tab !== undefined) return tab
		}
	}
	async getFileTabWithPath(filePath: string) {
		for (const tabSystem of this.tabSystems) {
			const tab = await tabSystem.get(
				(tab) => tab instanceof FileTab && tab.getPath() === filePath
			)
			if (tab !== undefined) return tab
		}
	}
	async openTab(tab: Tab, selectTab = true) {
		for (const tabSystem of this.tabSystems) {
			if (await tabSystem.hasTab(tab)) {
				if (selectTab) tabSystem.select(tab)
				return
			}
		}
		this.tabSystem?.add(tab, selectTab)
	}
	updateTabFolders() {
		const nameMap: Record<string, Tab[]> = {}
		for (const tabSystem of this.tabSystems) {
			tabSystem.tabs.forEach((tab) => {
				if (!(tab instanceof FileTab)) return

				const name = tab.name

				if (!nameMap[name]) nameMap[name] = []
				nameMap[name].push(tab)
			})
		}

		for (const name in nameMap) {
			const currentTabs = nameMap[name]
			if (currentTabs.length === 1) currentTabs[0].setFolderName(null)
			else {
				const folderDifference = getFolderDifference(
					currentTabs.map((tab) => tab.getPath())
				)
				currentTabs.forEach((tab, i) =>
					tab.setFolderName(folderDifference[i])
				)
			}
		}
	}

	absolutePath(filePath: string) {
		return `projects/${this.name}/${filePath}`
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
			this.compilerManager.updateFiles('default', [filePath]),
		])

		await this.jsonDefaults.updateDynamicSchemas(filePath)
	}
	async updateFiles(filePaths: string[]) {
		await Promise.all([
			this.packIndexer.updateFiles(filePaths),
			this.compilerManager.updateFiles('default', filePaths),
		])

		await this.jsonDefaults.updateMultipleDynamicSchemas(filePaths)
	}
	async unlinkFile(filePath: string) {
		await this.packIndexer.unlink(filePath)
		await this.compilerManager.unlink(filePath)
		await this.fileSystem.unlink(filePath)
	}
	async updateChangedFiles() {
		this.packIndexer.deactivate()
		this.compilerManager.deactivate()

		await this.packIndexer.activate(true)
		await this.compilerManager.start('default', 'dev')
	}

	async getFileFromDiskOrTab(filePath: string) {
		const tab = await this.getFileTabWithPath(filePath)
		if (tab && tab instanceof FileTab) return await tab.getFile()

		return await this.app.fileSystem.readFile(filePath)
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
	getPacks() {
		return (this._projectData.contains ?? []).map((pack) => pack.id)
	}
	addPack(packType: IPackData) {
		this._projectData.contains!.push(packType)
	}
	/**
	 * @deprecated Use `project.config.resolvePackPath(...)` instead
	 */
	getFilePath(packId: TPackTypeId, filePath?: string) {
		return this.config.resolvePackPath(packId, filePath)
	}
	isFileWithinAnyPack(filePath: string) {
		return this.getPacks()
			.map((packId) => this.config.resolvePackPath(packId))
			.some((packPath) => filePath.startsWith(packPath))
	}
	isFileWithinProject(filePath: string) {
		return (
			filePath.startsWith(`projects/${this.name}/`) ||
			this.isFileWithinAnyPack(filePath)
		)
	}

	async loadProject() {
		await this.config.setup()

		set(this, '_projectData', {
			...this.config.get(),
			path: this.name,
			name: this.name,
			imgSrc: await loadIcon(this, this.app.fileSystem),
			contains: [],
		})
		await loadPacks(this.app, this).then((packs) =>
			set(
				this._projectData,
				'contains',
				packs.sort((a, b) => a.id.localeCompare(b.id))
			)
		)
	}

	async recompile(forceStartIfActive = true) {
		if (forceStartIfActive) this.compilerManager.dispose()

		if (forceStartIfActive && this.isActiveProject) {
			this.compilerManager.start('default', 'dev', true)
		} else {
			await this.fileSystem.writeFile('.bridge/.restartDevServer', '')
		}
	}

	abstract getCurrentDataPackage(): Promise<AnyDirectoryHandle>
}
