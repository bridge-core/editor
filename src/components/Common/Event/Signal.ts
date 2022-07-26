import { EventDispatcher } from './EventDispatcher'
import { IDisposable } from '/@/types/disposable'

export class Signal<T> extends EventDispatcher<T> {
	protected firedTimes = 0
	protected data: T | undefined

	constructor(protected needsToFireAmount = 1) {
		super()
	}

	get fired() {
		return new Promise<T>((resolve) => this.once(resolve, false))
	}
	get hasFired() {
		return this.firedTimes >= this.needsToFireAmount
	}

	setFiredTimes(firedTimes: number) {
		this.firedTimes = firedTimes
	}

	resetSignal() {
		this.data = undefined
		this.firedTimes = 0
	}

	dispatch(data: T) {
		if (this.firedTimes < this.needsToFireAmount) this.firedTimes++
		this.data = data

		if (this.hasFired) return super.dispatch(data)
	}

	on(listener: (data: T) => void, getDisposable?: true): IDisposable
	on(listener: (data: T) => void, getDisposable: false): undefined
	on(
		listener: (data: T) => void,
		getDisposable?: boolean
	): IDisposable | undefined
	on(listener: (data: T) => void, getDisposable = true) {
		if (this.hasFired) listener(this.data!)

		return super.on(listener, getDisposable)
	}
}
