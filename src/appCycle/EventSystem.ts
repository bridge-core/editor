/**
 * Trigger and react to events
 */
import { v4 as uuid } from 'uuid'
import { IDisposable } from '@/types/disposable'

interface IEventState {
	[event: string]: Record<
		string,
		(...data: unknown[]) => void | Promise<unknown>
	>
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

	constructor(events: string[] | readonly string[] = []) {
		events.forEach(event => this.create(event))
	}

	create(name: string) {
		this.events.set(name, new EventDispatcher<T>())
		return {
			dispose: () => {
				this.events.delete(name)
			},
		}
	}

	protected getDispatcher(name: string) {
		const dispatcher = this.events.get(name)
		if (dispatcher === undefined)
			throw new Error(`No dispatcher defined for event "${name}".`)

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

export class Signal<T> extends EventDispatcher<T> {
	protected firedTimes = 0
	protected data: T | undefined

	constructor(protected needsToFireAmount = 1) {
		super()
	}

	get fired() {
		return new Promise<T>(resolve => this.once(resolve))
	}
	get hasFired() {
		return this.firedTimes >= this.needsToFireAmount
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
