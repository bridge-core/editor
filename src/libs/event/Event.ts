import { Disposable } from '@/libs/disposeable/Disposeable'

type Listener<T> = (value?: T) => void | Promise<void>

export class Event<T> {
	private listeners: Listener<T>[] = []

	public on(listener: Listener<T>): Disposable {
		this.listeners.push(listener)

		const event = this

		return {
			dispose() {
				event.listeners.splice(event.listeners.indexOf(listener), 1)
			},
		}
	}

	public dispatch(value?: T) {
		for (const listener of this.listeners) {
			listener(value)
		}
	}
}
