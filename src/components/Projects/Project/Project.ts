import { App } from '/@/App'
import { TabSystem } from '/@/components/TabSystem/TabSystem'
import Vue from 'vue'
import { IPackType, TPackTypeId } from '/@/components/Data/PackType'
import { TProjectConfig } from '../ProjectConfig'
import { RecentFiles } from '../RecentFiles'
import { loadIcon } from './loadIcon'
import { loadPacks } from './loadPacks'
import { PackIndexer } from '/@/components/PackIndexer/PackIndexer'
import { ProjectManager } from '../ProjectManager'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { CompilerManager } from '/@/components/Compiler/CompilerManager'
import { JsonDefaults } from '/@/components/Data/JSONDefaults'
import { TypeLoader } from '/@/components/Data/TypeLoader'

export interface IProjectData extends TProjectConfig {
	path: string
	name: string
	imgSrc: string
	contains: IPackType[]
}

export class Project {
	public readonly recentFiles!: RecentFiles
	public readonly tabSystems = [new TabSystem(this), new TabSystem(this, 1)]
	protected _projectData!: IProjectData
	// Not directly assigned so they're not responsive
	public readonly packIndexer: PackIndexer
	protected _fileSystem: FileSystem
	public readonly compilerManager = new CompilerManager(this)
	protected jsonDefaults = new JsonDefaults(this)
	protected typeLoader = new TypeLoader(this.app.fileSystem)

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
	get baseDirectory() {
		return this._baseDirectory
	}
	get fileSystem() {
		return this._fileSystem
	}
	//#endregion

	constructor(
		protected parent: ProjectManager,
		public readonly app: App,
		protected _baseDirectory: FileSystemDirectoryHandle
	) {
		this._fileSystem = new FileSystem(_baseDirectory)
		this.packIndexer = new PackIndexer(app, _baseDirectory)
		Vue.set(
			this,
			'recentFiles',
			new RecentFiles(
				app,
				`projects/${this.name}/bridge/recentFiles.json`
			)
		)
	}

	async activate(forceRefresh = false) {
		this.parent.title.setProject(this.name)
		for (const tabSystem of this.tabSystems) await tabSystem.activate()

		this.typeLoader.activate(this.tabSystem?.selectedTab?.getPackPath())
		await this.packIndexer.activate(forceRefresh).then(() => {
			this.jsonDefaults.activate()
			// this.compilerManager.start('default.json', 'dev')
		})
	}
	deactivate() {
		this.tabSystems.forEach((tabSystem) => tabSystem.deactivate())
		this.typeLoader.deactivate()
		this.packIndexer.deactivate()
		this.jsonDefaults.deactivate()
	}

	async refresh() {
		await this.deactivate()
		await this.activate(true)
	}

	openFile(filePath: string, selectTab = true) {
		for (const tabSystem of this.tabSystems) {
			const tab = tabSystem.getTab(filePath)
			if (tab) return selectTab ? tabSystem.select(tab) : undefined
		}

		this.tabSystem?.open(filePath, selectTab)
	}
	async updateFile(filePath: string) {
		await this.packIndexer.updateFile(filePath)
		await this.compilerManager.updateFile('default.json', filePath)

		App.eventSystem.dispatch('fileUpdated', filePath)
	}
	setActiveTabSystem(tabSystem: TabSystem, value: boolean) {
		this.tabSystems.forEach((tS) =>
			tabSystem !== tS ? tS.setActive(value, false) : undefined
		)
	}

	hasPacks(packTypes: TPackTypeId[]) {
		for (const packType of packTypes) {
			if (!this._projectData.contains.some(({ id }) => id === packType))
				return false
		}
		return true
	}

	async loadProject() {
		let config: any
		try {
			config = await this.app.fileSystem.readJSON(
				`projects/${this.name}/bridge/config.json`
			)
		} catch {
			config = {}
		}

		Vue.set(this, '_projectData', {
			...config,
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
}
