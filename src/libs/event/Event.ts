import { Disposable } from '@/libs/disposeable/Disposeable'

type Listener<T> = (value?: T) => void | Promise<void>

export class Event<T> {
	private listeners: Listener<T>[] = []

	public on(listener: Listener<T>): Disposable {
		this.listeners.push(listener)

		const event = this

		let disposed = false

		return {
			dispose() {
				if (disposed) return

				disposed = true

				event.listeners.splice(event.listeners.indexOf(listener), 1)
			},
		}
	}

	public once(listener: Listener<T>): Disposable {
		const event = this

		let disposed = false

		const onceListener: Listener<T> = (value?: T) => {
			disposed = true

			event.listeners.splice(event.listeners.indexOf(onceListener), 1)

			listener(value)
		}

		this.listeners.push(onceListener)

		return {
			dispose() {
				if (disposed) return

				disposed = true

				event.listeners.splice(event.listeners.indexOf(onceListener), 1)
			},
		}
	}

	public dispatch(value?: T) {
		const listeners = [...this.listeners]

		for (const listener of listeners) {
			listener(value)
		}
	}
}
