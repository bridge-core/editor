/**
 * Trigger and react to events
 */
import { v4 as uuid } from 'uuid'
import type { IDisposable } from '@/types/disposable'

interface IEventState {
	[event: string]: Record<string, (...data: unknown[]) => void | Promise<unknown>>
}

const EventState: IEventState = {}

export async function trigger(event: string, ...data: unknown[]) {
	if (EventState[event] !== undefined)
		return await Promise.all(
			Object.values(EventState[event]).map(cb => cb(...data))
		)
}

export function on(
	event: string,
	cb: (...data: unknown[]) => void
): IDisposable {
	const eventUUID = uuid()
	if (EventState[event] === undefined) EventState[event] = {}
	EventState[event][eventUUID] = cb

	return {
		dispose() {
			delete EventState[event][eventUUID]
		},
	}
}

export function once(event: string, cb: (...data: unknown[]) => void) {
	const disposable = on(event, (...data: unknown[]) => {
		disposable.dispose()
		return cb(...data)
	})
}


export class EventManager<T> {
	protected events = new Map<string, EventDispatcher<T>>()
	
	create(name: string) {
		this.events.set(name, new EventDispatcher<T>())
		return {
			dispose: () => {
				this.events.delete(name)
			}
		}
	}

	protected getDispatcher(name: string) {
		const dispatcher = this.events.get(name)
		if(dispatcher === undefined) throw new Error(`No dispatcher defined for event "${name}".`)

		return dispatcher
	}

	dispatch(name: string, data: T) {
		return this.getDispatcher(name).dispatch(data)
	}
	on(name: string, listener: (data: T) => void) {
		return this.getDispatcher(name).on(listener)
	}
	off(name: string, listener: (data: T) => void) {
		return this.getDispatcher(name).off(listener)
	}
	once(name: string, listener: (data: T) => void) {
		return this.getDispatcher(name).once(listener)
	}
}

export class EventDispatcher<T> {
	protected listeners = new Set<(data: T) => void>()

	constructor() {
		
	}

	dispatch(data: T) {
		this.listeners.forEach(listener => listener(data))
	}

	on(listener: (data: T) => void, getDisposable=true) {
		this.listeners.add(listener)

		if(getDisposable)
			return {
				dispose: () => {
					this.off(listener)
				}
			}
	}

	off(listener: (data: T) => void) {
		this.listeners.delete(listener)
	}

	once(listener: (data: T) => void) {
		const disposable = this.on((data) => {
			listener(data)
			disposable!.dispose()
		})
	}
}

export class Signal<T> extends EventDispatcher<T> {
	protected hasFired = false
	protected data?: T

	constructor() {
		super()
	}

	dispatch(data: T) {
		this.hasFired = true
		this.data = data
		super.dispatch(data)
	}

	on(listener: (data: T) => void) {
		// Needs to be on a timeout because otherwise Signal.once doesn't work
		if(this.hasFired) setTimeout(() => listener(this.data!))

		return super.on(listener)
	}
}