import { App } from '@/App'
import { TabSystem } from '../../TabSystem/TabSystem'
import Vue from 'vue'
import { IPackType, PackType } from '../../Data/PackType'
import { TProjectConfig } from '../ProjectConfig'
import { RecentFiles } from '../RecentFiles'
import { loadIcon } from './loadIcon'
import { loadPacks } from './loadPacks'
import { PackIndexer } from '@/components/PackIndexer/PackIndexer'
import { ProjectManager } from '../ProjectManager'
import { FileSystem } from '@/components/FileSystem/FileSystem'

export interface IProjectData extends TProjectConfig {
	path: string
	name: string
	imgSrc: string
	contains: IPackType[]
}

export class Project {
	public readonly recentFiles!: RecentFiles
	public readonly tabSystems = [new TabSystem(this), new TabSystem(this)]
	protected _projectData!: IProjectData
	// Not directly assigned so they're not responsive
	public readonly packIndexer: PackIndexer
	protected fileSystem: FileSystem

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

	constructor(
		protected parent: ProjectManager,
		protected app: App,
		protected baseDirectory: FileSystemDirectoryHandle
	) {
		this.fileSystem = new FileSystem(baseDirectory)
		this.packIndexer = new PackIndexer(app, baseDirectory)
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
		this.tabSystems.forEach(tabSystem => tabSystem.activate())
		this.packIndexer.activate(forceRefresh)
	}
	deactivate() {
		this.tabSystems.forEach(tabSystem => tabSystem.deactivate())
		this.packIndexer.deactivate()
	}

	async refresh() {
		await this.deactivate()
		await this.activate(true)
	}

	openFile(filePath: string) {
		for (const tabSystem of this.tabSystems) {
			const tab = tabSystem.getTab(filePath)
			if (tab) return tabSystem.select(tab)
		}

		this.tabSystem?.open(filePath)
	}
	async updateFile(filePath: string) {
		await this.updateFile(filePath)
		await this.app.compiler.updateFile('dev', 'default.json', filePath)
		this.app.project?.openFile(`projects/${this.name}/${filePath}`)
	}
	setActiveTabSystem(tabSystem: TabSystem, value: boolean) {
		this.tabSystems.forEach(tS =>
			tabSystem !== tS ? tS.setActive(value, false) : undefined
		)
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
			imgSrc: await loadIcon(`projects/${this.name}`),
			contains: await loadPacks(this.app, this.name),
		})
	}
}
