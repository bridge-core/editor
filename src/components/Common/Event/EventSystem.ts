/**
 * Trigger and react to events
 */

import { EventDispatcher } from './EventDispatcher'

export class EventSystem<T> {
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
