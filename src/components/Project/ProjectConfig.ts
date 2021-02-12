import { App } from '@/App'
import { FileSystem } from '../FileSystem/FileSystem'

export type TProjectConfigKey =
	| 'projectPrefix'
	| 'projectTargetVersion'
	| 'projectAuthor'
	| 'darkTheme'
	| 'lightTheme'
export type TProjectConfig = {
	[key in TProjectConfigKey]: unknown
}

export class ProjectConfig {
	protected data: any
	protected fileSystem!: FileSystem

	constructor() {
		App.ready.once(app => (this.fileSystem = app.fileSystem))
		App.eventSystem.on('projectChanged', () => {
			this.data = undefined
		})
	}

	protected async loadData() {
		const app = await App.getApp()
		try {
			this.data = await this.fileSystem.readJSON(
				`projects/${app.selectedProject}/bridge/config.json`
			)
		} catch {
			this.data = {}
		}
	}

	async getConfig() {
		if (!this.data) await this.loadData()
		return this.data
	}

	async get(key: TProjectConfigKey) {
		if (!this.data) await this.loadData()
		return this.data![key]
	}
	async set(key: TProjectConfigKey, data: unknown) {
		const app = await App.getApp()
		if (!this.data) await this.loadData()
		this.data![key] = data

		await this.fileSystem.writeJSON(
			`projects/${app.selectedProject}/bridge/config.json`,
			this.data,
			true
		)
	}
}
