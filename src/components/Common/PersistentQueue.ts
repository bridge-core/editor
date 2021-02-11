import { App } from '@/App'
import { Signal } from './Event/Signal'
import { Queue } from './Queue'
import Vue from 'vue'

export class PersistentQueue extends Signal<Queue<string>> {
	protected queue = Vue.observable(new Queue<string>(3))
	constructor(protected app: App, protected savePath: string) {
		super()
		this.setup()
	}

	async setup() {
		const recentFiles: string[] = await this.app.fileSystem
			.readJSON(this.savePath)
			.catch(() => [])
		recentFiles.forEach(recentFile => this.queue.add(recentFile))
		this.dispatch(this.queue)
	}

	async add(filePath: string) {
		await this.fired

		this.queue.add(filePath)
		await this.app.fileSystem.writeJSON(this.savePath, this.queue.toJSON())
	}
}
