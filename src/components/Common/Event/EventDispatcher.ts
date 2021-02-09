export class EventDispatcher<T> {
	protected listeners = new Set<(data: T) => void>()

	constructor() {}

	dispatch(data: T) {
		this.listeners.forEach(listener => listener(data))
	}

	on(listener: (data: T) => void, getDisposable = true) {
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
}
