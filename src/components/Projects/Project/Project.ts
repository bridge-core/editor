import { App } from '/@/App'
import { IOpenTabOptions, TabSystem } from '/@/components/TabSystem/TabSystem'
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
import {
	AnyDirectoryHandle,
	AnyFileHandle,
} from '/@/components/FileSystem/Types'
import { markRaw, reactive, set } from '@vue/composition-api'
import { SnippetLoader } from '/@/components/Snippets/Loader'
import { ExportProvider } from '../Export/Extensions/Provider'
import { Tab } from '/@/components/TabSystem/CommonTab'

export interface IProjectData extends IConfigJson {
	path: string
	name: string
	imgSrc: string
	contains: (IPackType & { version: [number, number, number] })[]
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
	public readonly extensionLoader: ExtensionLoader
	public readonly fileChange = new FileChangeRegistry()
	public readonly fileSave = new FileChangeRegistry()
	public readonly tabActionProvider = new TabActionProvider()
	public readonly snippetLoader = new SnippetLoader()
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
		this.packIndexer = new PackIndexer(app, _baseDirectory)
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
		this.parent.title.setProject(this.name)
		this.parent.activatedProject.dispatch(this)

		if (!isReload) {
			for (const tabSystem of this.tabSystems) await tabSystem.activate()
		}

		await this.extensionLoader.loadExtensions()

		const selectedTab = this.tabSystem?.selectedTab
		this.typeLoader.activate(
			selectedTab instanceof FileTab
				? selectedTab.getProjectPath()
				: undefined
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
		App.packExplorer.refresh()
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
	async openTab(tab: Tab, selectTab = true) {
		for (const tabSystem of this.tabSystems) {
			if (await tabSystem.hasTab(tab)) {
				if (selectTab) tabSystem.select(tab)
				return
			}
		}
		this.tabSystem?.add(tab, selectTab)
	}

	absolutePath(filePath: string) {
		return `projects/${this.name}/${filePath}`
	}
	getProjectPath(fileHandle: AnyFileHandle) {
		return this.baseDirectory
			.resolve(<any>fileHandle)
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
	getPacks() {
		return (this._projectData.contains ?? []).map((pack) => pack.id)
	}
	addPack(packType: IPackType & { version: [number, number, number] }) {
		this._projectData.contains!.push(packType)
	}

	async loadProject() {
		await this.config.setup()

		set(this, '_projectData', {
			...this.config.get(),
			path: this.name,
			name: this.name,
			imgSrc: await loadIcon(
				`projects/${this.name}`,
				this.app.fileSystem
			),
			contains: [],
		})
		await loadPacks(this.app, this.name).then((packs) =>
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
