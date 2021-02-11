import { App } from '@/App'
import { Signal } from './Event/Signal'
import { Queue } from './Queue'
import Vue from 'vue'
import { dirname } from 'path'

export class PersistentQueue<T> extends Signal<Queue<T>> {
	protected queue!: Queue<T>
	constructor(
		protected app: App,
		maxSize: number,
		protected savePath: string
	) {
		super()
		Vue.set(this, 'queue', new Queue<T>(maxSize))
		this.setup()
	}

	async setup() {
		await this.app.fileSystem.fired

		let data = []
		try {
			data = await this.app.fileSystem.readJSON(this.savePath)
		} catch {}

		data.forEach((e: T) => this.queue.add(e))
		this.dispatch(this.queue)
	}

	protected isEquals(e1: T, e2: T) {
		return e1 === e2
	}

	async add(e: T) {
		await this.fired

		this.queue.add(e, this.isEquals.bind(this))

		await this.app.fileSystem.mkdir(dirname(this.savePath), {
			recursive: true,
		})
		await this.app.fileSystem.writeFile(this.savePath, this.queue.toJSON())
	}

	get elements() {
		return this.queue.elements
	}
}
