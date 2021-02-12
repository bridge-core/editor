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
	public readonly tabSystem = new TabSystem(this)
	protected _projectData!: IProjectData

	get projectData() {
		return this._projectData
	}
	get name() {
		return this._name
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

	async loadProject() {
		let config: any
		try {
			config = await this.app.fileSystem.readJSON(
				`projects/${this.name}/bridge/config.json`
			)
		} catch {
			config = {}
		}
		console.log(this.name, await loadPacks(this.app, this.name))

		this._projectData = {
			...config,
			path: this.name,
			name: this.name,
			imgSrc: await loadIcon(`projects/${this.name}`),
			contains: await loadPacks(this.app, this.name),
		}
	}
}
