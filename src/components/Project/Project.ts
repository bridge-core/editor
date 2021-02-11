import { App } from '@/App'
import { PersistentQueue } from '../Common/PersistentQueue'
import { TabSystem } from '../TabSystem/TabSystem'
import Vue from 'vue'
import { IPackType, PackType } from '../Data/PackType'
import { TProjectConfig } from './ProjectConfig'
import { loadAsDataURL } from '@/utils/loadAsDataUrl'

export interface IProjectData extends TProjectConfig {
	path: string
	projectName: string
	imgSrc: string
	contains: IPackType[]
}

export class Project {
	public readonly recentFiles: PersistentQueue
	public readonly tabSystem = Vue.observable(new TabSystem(this))
	protected _projectData!: IProjectData

	get projectData() {
		return this._projectData
	}
	get name() {
		return this._name
	}

	constructor(protected app: App, protected _name: string) {
		this.recentFiles = new PersistentQueue(
			app,
			`projects/${this.name}/bridge/recentFiles.json`
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

		this._projectData = {
			...config,
			path: this.name,
			projectName: this.name,
			imgSrc: await loadAsDataURL(
				`projects/${this.name}/bridge/packIcon.png`
			),
			contains: <IPackType[]>(
				(await this.app.fileSystem.readdir(`projects/${this.name}`))
					.map(path => PackType.get(`projects/${this.name}/${path}`))
					.filter(pack => pack !== undefined)
			),
		}
	}
}
