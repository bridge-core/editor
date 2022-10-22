import { App } from '/@/App'
import { Signal } from './Event/Signal'
import { Queue } from './Queue'
import { set, markRaw } from 'vue'
import { dirname } from '/@/utils/path'

export class PersistentQueue<T> extends Signal<Queue<T>> {
	protected queue!: Queue<T>
	protected app: App

	constructor(
		app: App,
		protected maxSize: number,
		protected savePath: string,
		callSetup = true
	) {
		super()
		set(this, 'queue', new Queue<T>(maxSize))
		this.app = markRaw(app)

		if (callSetup) this.setup()
	}

	async setup() {
		await this.app.fileSystem.fired

		let data = []
		try {
			data = await this.app.fileSystem.readJSON(this.savePath)
		} catch {}

		this.queue.fromArray(data)
		this.dispatch(this.queue)
	}

	protected isEquals(e1: T, e2: T) {
		return e1 === e2
	}

	keep(cb: (e: T) => boolean) {
		const queue = new Queue<T>(this.maxSize)

		this.elements
			.filter((e) => cb(e))
			.forEach((e) => queue.add(e, this.isEquals.bind(this)))

		this.queue = queue
	}

	async add(e: T) {
		await this.fired

		this.queue.add(e, this.isEquals.bind(this))

		await this.saveQueue()
	}
	async remove(e: T) {
		await this.fired

		this.queue.remove(e, this.isEquals.bind(this))

		await this.saveQueue()
	}
	clear() {
		this.queue.clear()
		return this.saveQueue()
	}
	protected async saveQueue() {
		await this.app.fileSystem.mkdir(dirname(this.savePath), {
			recursive: true,
		})
		await this.app.fileSystem.writeFile(this.savePath, this.queue.toJSON())
	}

	get elements() {
		return this.queue.elements
	}
}
