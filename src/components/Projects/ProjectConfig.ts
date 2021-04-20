import { FileSystem } from '../FileSystem/FileSystem'

export type TProjectConfigKey =
	| 'prefix'
	| 'targetVersion'
	| 'author'
	| 'darkTheme'
	| 'lightTheme'
	| 'gameTestAPI'
	| 'scriptingAPI'
export type TProjectConfig = {
	[key in TProjectConfigKey]: unknown
}

export class ProjectConfig {
	protected data: any

	constructor(protected fileSystem: FileSystem) {}

	protected async loadData() {
		try {
			this.data = await this.fileSystem.readJSON(`.bridge/config.json`)
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
		if (!this.data) await this.loadData()
		this.data![key] = data

		await this.fileSystem.writeJSON(`.bridge/config.json`, this.data, true)
	}
}
