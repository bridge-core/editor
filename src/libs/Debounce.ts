import { Disposable } from '@/libs/disposeable/Disposeable'

export function debounce(action: () => void, delay: number, triggerOnDispose: boolean = true): Disposable & { invoke: () => void } {
	let ready = true
	let inFlight = false

	let timeout: number | null = null

	const invoke = () => {
		if (!ready) {
			inFlight = true

			return
		}

		inFlight = false
		ready = false

		timeout = setTimeout(() => {
			ready = true

			timeout = null

			if (inFlight) invoke()
		}, delay)

		action()
	}

	const dispose = () => {
		if (triggerOnDispose) action()

		if (timeout !== null) clearTimeout(timeout)
	}

	return {
		invoke,
		dispose,
	}
}
