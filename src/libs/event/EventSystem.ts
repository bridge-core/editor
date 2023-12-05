import { EventDispatcher } from './EventDispatcher'

export class EventSystem<T> {
	protected events = new Map<string, EventDispatcher<T>>()
	public readonly any = new EventDispatcher<[string, T]>()

	constructor(
		events: string[] | readonly string[] = [],
		protected autoCleanEmptyDispatchers = false
	) {
		events.forEach((event) => this.create(event))
	}

	create(name: string) {
		const dispatcher = this.events.get(name)
		if (dispatcher !== undefined)
			throw new Error(
				`Dispatcher for event "${name}" is already defined.`
			)

		this.events.set(name, new EventDispatcher<T>())
		return {
			dispose: () => {
				this.events.delete(name)
			},
		}
	}
	hasEvent(name: string) {
		return this.events.has(name)
	}

	protected getDispatcher(name: string) {
		const dispatcher = this.events.get(name)
		if (dispatcher === undefined)
			throw new Error(`No dispatcher defined for event "${name}".`)

		return dispatcher
	}

	dispatch(name: string, data: T) {
		this.any.dispatch([name, data])
		return this.getDispatcher(name).dispatch(data)
	}
	on(name: string, listener: (data: T) => void) {
		const dispatcher = this.getDispatcher(name)
		const disposable = dispatcher.on(listener)

		return {
			dispose: () => {
				disposable.dispose()
				if (this.autoCleanEmptyDispatchers && !dispatcher.hasListeners)
					this.events.delete(name)
			},
		}
	}
	off(name: string, listener: (data: T) => void) {
		const dispatcher = this.getDispatcher(name)
		dispatcher.off(listener)
		if (this.autoCleanEmptyDispatchers && !dispatcher.hasListeners)
			this.events.delete(name)
	}
	once(name: string, listener: (data: T) => void) {
		const dispatcher = this.getDispatcher(name)

		dispatcher.once((data: T) => {
			listener(data)
			if (this.autoCleanEmptyDispatchers && !dispatcher.hasListeners)
				this.events.delete(name)
		})
	}
}
