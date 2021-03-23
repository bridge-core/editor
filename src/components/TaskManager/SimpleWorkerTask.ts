import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'

class Progress {
	constructor(
		protected taskService: SimpleTaskService,
		protected current: number,
		protected total: number,
		protected prevTotal: number
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
		return this.total > this.prevTotal ? this.total : this.prevTotal
	}
	getCurrent() {
		return this.current
	}

	setTotal(val: number) {
		this.total = val
	}
}

export abstract class SimpleTaskService extends EventDispatcher<
	[number, number]
> {
	protected lastDispatch = 0
	public progress = new Progress(this, 0, 100, 100)

	constructor() {
		super()
	}

	dispatch(data: [number, number]) {
		// Otherwise, first check that we don't send too many messages to the main thread
		if (this.lastDispatch + 200 > Date.now()) return

		super.dispatch(data)
		this.lastDispatch = Date.now()
	}
}
