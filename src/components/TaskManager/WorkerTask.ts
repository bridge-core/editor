import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { EventDispatcher } from '../../libs/event/EventDispatcher'

class LegacyProgress<T, K> {
	constructor(
		protected taskService: TaskService<T, K>,
		protected current: number,
		protected total: number
	) {}

	addToCurrent(value?: number) {
		this.current += value ?? 1
		this.taskService.dispatch([this.getCurrent(), this.getTotal()])
	}
	addToTotal(value?: number) {
		this.total += value ?? 1
		this.taskService.dispatch([this.getCurrent(), this.getTotal()])
	}

	getTotal() {
		return this.total
	}
	getCurrent() {
		return this.current
	}

	setTotal(val: number) {
		this.total = val
	}
}

export abstract class TaskService<T, K = void> extends EventDispatcher<
	[number, number]
> {
	protected lastDispatch = 0
	public progress!: LegacyProgress<T, K>

	protected abstract onStart(data: K): Promise<T> | T

	async start(data: K) {
		this.progress = new LegacyProgress(this, 0, 0)

		const result = await this.onStart(data)

		this.dispatch([this.progress.getCurrent(), this.progress.getCurrent()])

		return result
	}

	dispatch(data: [number, number]) {
		// Otherwise, first check that we don't send too many messages to the main thread
		if (this.lastDispatch + 200 > Date.now()) return

		super.dispatch(data)
		this.lastDispatch = Date.now()
	}
}
