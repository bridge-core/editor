import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'

export class Progress extends EventDispatcher<[number, number]> {
	constructor(
		protected current: number,
		protected total: number,
		protected prevTotal: number
	) {
		super()
	}

	addToCurrent(value?: number) {
		this.current += value ?? 1
		this.dispatch([this.getCurrent(), this.getTotal()])
	}
	addToTotal(value?: number) {
		this.total += value ?? 1
		this.dispatch([this.getCurrent(), this.getTotal()])
	}

	getTotal() {
		return this.total > this.prevTotal ? this.total : this.prevTotal
	}
	getCurrent() {
		return this.current
	}

	get isDone() {
		return this.getCurrent() === this.getTotal()
	}

	setTotal(val: number) {
		this.total = val
	}
}
