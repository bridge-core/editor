import { App } from '/@/App'
import { IOpenTabOptions, TabSystem } from '/@/components/TabSystem/TabSystem'
import { TPackTypeId } from '/@/components/Data/PackType'
import { ProjectConfig, IConfigJson } from './Config'
import { RecentFiles } from '../RecentFiles'
import { loadIcon } from './loadIcon'
import { IPackData, loadPacks } from './loadPacks'
import { PackIndexer } from '/@/components/PackIndexer/PackIndexer'
import { ProjectManager } from '../ProjectManager'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
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
import { FileTypeLibrary } from '/@/components/Data/FileType'
import { relative } from '/@/utils/path'
import { DashCompiler } from '/@/components/Compiler/Compiler'
import { proxy, Remote } from 'comlink'
import { DashService } from '/@/components/Compiler/Worker/Service'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'

export interface IProjectData extends IConfigJson {
	path: string
	name: string
	imgSrc: string
	contains: IPackData[]
}

export const virtualProjectName = 'bridge-temp-project'

export abstract class Project {
	public readonly tabSystems: readonly [TabSystem, TabSystem]
	protected _projectData!: Partial<IProjectData>
	// Not directly assigned so they're not responsive
	public readonly packIndexer: PackIndexer
	protected _fileSystem: FileSystem
	public _compilerService?: Remote<DashService>
	public compilerReady: Promise<void>
	public readonly jsonDefaults = markRaw(new JsonDefaults(this))
	protected typeLoader: TypeLoader

	/**
	 * A virtual project is a project with the exact name of "virtualProjectName"
	 * We use it as a placeholder project to skip the previously mandatory bridge folder selection dialog
	 */
	public readonly isVirtualProject: boolean
	public readonly requiresPermissions: boolean
	public readonly config: ProjectConfig
	public readonly fileTypeLibrary: FileTypeLibrary
	public readonly extensionLoader: ExtensionLoader
	public readonly fileChange = new FileChangeRegistry()
	public readonly fileSave = new FileChangeRegistry()
	public readonly fileUnlinked = new FileChangeRegistry<void>()
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
	get compilerService() {
		if (!this._compilerService)
			throw new Error(
				`Trying to access compilerService before it was setup. Make sure to await compilerReady before accessing it.`
			)

		return this._compilerService
	}
	protected get watchModeActive() {
		// Only update compilation results if the watch mode setting is active and the current project is not a virtual project
		return (
			(settingsState.compiler?.watchModeActive ?? true) &&
			!this.isVirtualProject
		)
	}
	//#endregion
	get projectPath() {
		if (this.requiresPermissions) return `projects/${this.name}`
		return `~local/projects/${this.name}`
	}

	constructor(
		protected parent: ProjectManager,
		public readonly app: App,
		protected _baseDirectory: AnyDirectoryHandle,
		{ requiresPermissions }: { requiresPermissions?: boolean } = {}
	) {
		this.isVirtualProject = virtualProjectName === this.name
		this.requiresPermissions = requiresPermissions ?? false

		this._fileSystem = markRaw(new FileSystem(_baseDirectory))
		this.config = markRaw(
			new ProjectConfig(this._fileSystem, this.projectPath, this)
		)
		this.fileTypeLibrary = markRaw(new FileTypeLibrary(this.config))
		this.packIndexer = markRaw(new PackIndexer(this, _baseDirectory))
		this.extensionLoader = markRaw(
			new ExtensionLoader(
				app.fileSystem,
				`${this.projectPath}/.bridge/extensions`,
				`${this.projectPath}/.bridge/inactiveExtensions.json`
			)
		)
		this.typeLoader = markRaw(new TypeLoader(this.app.dataLoader))

		this.fileChange.any.on((data) =>
			App.eventSystem.dispatch('fileChange', data)
		)
		this.fileSave.any.on((data) =>
			App.eventSystem.dispatch('fileSave', data)
		)
		this.fileUnlinked.any.on((data) =>
			App.eventSystem.dispatch('fileUnlinked', data[0])
		)

		this.tabSystems = <const>[new TabSystem(this), new TabSystem(this, 1)]

		this.compilerReady = this.createDashService('development').then(
			(service) => {
				this._compilerService = markRaw(service)
			}
		)

		setTimeout(() => this.onCreate(), 0)
	}

	async createDashService(
		mode: 'development' | 'production',
		compilerConfig?: string
	) {
		await this.app.comMojang.fired

		const compiler = await new DashCompiler(
			this.app.fileSystem.baseDirectory,
			this.app.comMojang.hasComMojang
				? this.app.comMojang.fileSystem.baseDirectory
				: undefined,
			{
				config: `${this.projectPath}/config.json`,
				compilerConfig,
				mode,
				projectName: this.name,
				pluginFileTypes: this.fileTypeLibrary.getPluginFileTypes(),
			}
		)

		compiler.on(
			proxy(async () => {
				const task = this.app.taskManager.create({
					icon: 'mdi-cogs',
					name: 'taskManager.tasks.compiler.title',
					description: 'taskManager.tasks.compiler.description',
					totalTaskSteps: 100,
				})

				compiler.onProgress(
					proxy((percentage) => {
						if (percentage === 1) task.complete()
						else task.update(100 * percentage)
					})
				)
			}),
			false
		)

		return compiler
	}

	abstract onCreate(): Promise<void> | void

	async activate(isReload = false) {
		App.fileType.setProjectConfig(this.config)
		App.packType.setProjectConfig(this.config)
		this.parent.title.setProject(this.name)
		this.parent.activatedProject.dispatch(this)

		await this.fileTypeLibrary.setup(this.app.dataLoader)
		// Wait for compilerService to be ready
		await this.compilerReady

		if (!isReload) {
			for (const tabSystem of this.tabSystems) await tabSystem.activate()
		}

		await this.extensionLoader.loadExtensions()

		const selectedTab = this.tabSystem?.selectedTab
		this.typeLoader.activate(
			selectedTab instanceof FileTab ? selectedTab.getPath() : undefined
		)

		// Data needs to be loaded into IndexedDB before the PackIndexer can be used
		await this.app.dataLoader.fired

		await Promise.all([
			this.packIndexer.activate(isReload),
			this.compilerService.setup(),
		])
		const [changedFiles, deletedFiles] = await this.packIndexer.fired

		// Only recompile changed files if the setting is active and the project is not a virtual project
		const autoFetchChangedFiles =
			(settingsState.compiler?.autoFetchChangedFiles ?? true) &&
			!this.isVirtualProject

		await Promise.all([
			this.jsonDefaults.activate(),
			autoFetchChangedFiles
				? this.compilerService.start(changedFiles, deletedFiles)
				: Promise.resolve(),
		])

		this.snippetLoader.activate()
	}
	deactivate(isReload = false) {
		if (!isReload)
			this.tabSystems.forEach((tabSystem) => tabSystem.deactivate())

		this.typeLoader.deactivate()
		this.packIndexer.deactivate()
		this.jsonDefaults.deactivate()
		this.extensionLoader.disposeAll()
		this.snippetLoader.deactivate()
	}
	disposeWorkers() {
		this.packIndexer.dispose()
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

	async openFile(
		fileHandle: AnyFileHandle,
		options: IOpenTabOptions & { openInSplitScreen?: boolean } = {}
	) {
		for (const tabSystem of this.tabSystems) {
			const tab = await tabSystem.getTab(fileHandle)
			if (tab)
				return options.selectTab ?? true
					? tabSystem.select(tab)
					: undefined
		}

		if (!options.openInSplitScreen)
			await this.tabSystem?.open(fileHandle, options)
		else await this.inactiveTabSystem?.open(fileHandle, options)
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
		return `${this.projectPath}/${filePath}`
	}
	relativePath(filePath: string) {
		return relative(this.projectPath, filePath)
	}

	async updateFile(filePath: string) {
		// We already have a check for foreign files inside of the TabSystem.save(...) function
		// but there are a lot of sources that call updateFile(...)
		try {
			await this.app.fileSystem.getFileHandle(filePath)
		} catch {
			// This is a foreign file, don't process it
			return
		}

		await Promise.all([
			this.packIndexer.updateFile(filePath),
			this.watchModeActive
				? this.compilerService.updateFiles([filePath])
				: Promise.resolve(),
		])

		await this.jsonDefaults.updateDynamicSchemas(filePath)
	}
	async updateFiles(filePaths: string[]) {
		await this.packIndexer.updateFiles(filePaths)

		if (this.watchModeActive)
			await this.compilerService.updateFiles(filePaths)

		await this.jsonDefaults.updateMultipleDynamicSchemas(filePaths)
	}
	async unlinkFile(filePath: string) {
		await this.packIndexer.unlink(filePath)

		if (this.watchModeActive) await this.compilerService.unlink(filePath)
		await this.app.fileSystem.unlink(filePath)

		this.fileUnlinked.dispatch(filePath)

		// Reload dynamic schemas
		const currentPath = this.tabSystem?.selectedTab?.getPath()
		if (currentPath)
			await this.jsonDefaults.updateDynamicSchemas(currentPath)
	}
	async renameFile(fromPath: string, toPath: string) {
		await this.app.fileSystem.move(fromPath, toPath)

		await this.unlinkFile(fromPath)
		await this.updateFile(toPath)
	}
	async updateChangedFiles() {
		this.packIndexer.deactivate()

		await this.packIndexer.activate(true)
		await this.compilerService.build()
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
			filePath.startsWith(`${this.projectPath}/`) ||
			this.isFileWithinAnyPack(filePath)
		)
	}

	async loadProject() {
		await this.config.setup()

		const [iconUrl, packs] = await Promise.all([
			loadIcon(this, this.app.fileSystem),
			loadPacks(this.app, this),
		])

		set(this, '_projectData', {
			...this.config.get(),
			path: this.name,
			name: this.name,
			imgSrc: iconUrl,
			contains: packs.sort((a, b) => a.id.localeCompare(b.id)),
		})
	}

	async recompile(forceStartIfActive = true) {
		if (forceStartIfActive && this.isActiveProject) {
			await this.fileSystem.writeFile('.bridge/.restartWatchMode', '')
			this.compilerService.build()
		} else {
			await this.fileSystem.writeFile('.bridge/.restartWatchMode', '')
		}
	}

	abstract getCurrentDataPackage(): Promise<AnyDirectoryHandle>
}
