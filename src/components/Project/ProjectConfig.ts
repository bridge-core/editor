import { App } from '@/App'
import { FileSystem } from '../FileSystem/Main'
import { selectedProject } from './Loader'

export class ProjectConfig {
	protected data: Record<string, unknown> | undefined

	constructor(protected fileSystem: FileSystem) {
		App.eventSystem.on('projectChanged', () => {
			this.data = undefined
		})
	}

	protected async loadData() {
		try {
			this.data = await this.fileSystem.readJSON(
				`projects/${selectedProject}/bridge/config.json`
			)
		} catch {
			this.data = {}
		}
	}

	async getConfig() {
		if (!this.data) await this.loadData()
		return this.data
	}

	async get(key: string) {
		if (!this.data) await this.loadData()
		return this.data![key]
	}
	async set(key: string, data: unknown) {
		if (!this.data) await this.loadData()
		this.data![key] = data

		await this.fileSystem.writeJSON(
			`projects/${selectedProject}/bridge/config.json`,
			this.data
		)
	}
}
