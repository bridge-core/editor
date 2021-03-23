import { EventDispatcher } from './EventDispatcher'

export class Signal<T> extends EventDispatcher<T> {
	protected firedTimes = 0
	protected data: T | undefined

	constructor(protected needsToFireAmount = 1) {
		super()
	}

	get fired() {
		return new Promise<T>((resolve) => this.once(resolve))
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

	on(listener: (data: T) => void) {
		// Needs to be on a timeout because otherwise Signal.once doesn't work
		if (this.hasFired) listener(this.data!)

		return super.on(listener)
	}
}
