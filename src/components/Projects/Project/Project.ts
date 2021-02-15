import { App } from '@/App'
import { TabSystem } from '../../TabSystem/TabSystem'
import Vue from 'vue'
import { IPackType, PackType } from '../../Data/PackType'
import { TProjectConfig } from '../ProjectConfig'
import { RecentFiles } from '../RecentFiles'
import { loadIcon } from './loadIcon'
import { loadPacks } from './loadPacks'

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

	get projectData() {
		return this._projectData
	}
	get name() {
		return this._name
	}
	get tabSystem() {
		if (this.tabSystems[0].isActive) return this.tabSystems[0]
		if (this.tabSystems[1].isActive) return this.tabSystems[1]
	}

	constructor(protected app: App, protected _name: string) {
		Vue.set(
			this,
			'recentFiles',
			new RecentFiles(
				app,
				`projects/${this.name}/bridge/recentFiles.json`
			)
		)
	}

	activate() {
		this.tabSystems.forEach(tabSystem => tabSystem.activate())
	}
	deactivate() {
		this.tabSystems.forEach(tabSystem => tabSystem.deactivate())
	}

	openFile(filePath: string) {
		for (const tabSystem of this.tabSystems) {
			const tab = tabSystem.getTab(filePath)
			if (tab) return tabSystem.select(tab)
		}

		this.tabSystem?.open(filePath)
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
