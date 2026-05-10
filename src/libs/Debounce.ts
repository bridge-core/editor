import { Disposable } from '@/libs/disposeable/Disposeable'

/**
 * Limit an action from being triggered too often
 * @param action The function to limit
 * @param delay A delay in seconds between calls
 * @returns A disposable that disposes the timeout
 */
export function debounce(action: () => void, delay: number): Disposable & { invoke: () => void } {
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
		if (inFlight) action()

		if (timeout !== null) clearTimeout(timeout)
	}

	return {
		invoke,
		dispose,
	}
}
