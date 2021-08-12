import { IDisposable } from '/@/types/disposable'

export class EventDispatcher<T> {
	protected listeners = new Set<(data: T) => void>()

	constructor() {}

	get hasListeners() {
		return this.listeners.size > 0
	}
	dispatch(data: T) {
		this.listeners.forEach((listener) => listener(data))
	}

	on(listener: (data: T) => void, getDisposable?: true): IDisposable
	on(listener: (data: T) => void, getDisposable: false): undefined
	on(
		listener: (data: T) => void,
		getDisposable?: boolean
	): IDisposable | undefined
	on(listener: (data: T) => void, getDisposable: boolean = true) {
		this.listeners.add(listener)

		if (getDisposable)
			return {
				dispose: () => {
					this.off(listener)
				},
			}
	}

	off(listener: (data: T) => void) {
		this.listeners.delete(listener)
	}

	once(listener: (data: T) => void) {
		const callback = (data: T) => {
			listener(data)
			this.off(callback)
		}
		this.on(callback)
	}

	disposeListeners() {
		this.listeners = new Set()
	}
}
