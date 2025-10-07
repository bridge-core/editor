import { Disposable } from '@/libs/disposeable/Disposeable'

/**
 * Only trigger an action after not receiving any additional invokes for a specified amount of time
 * @param action The function to limit
 * @param delay A delay in seconds
 * @returns A disposable that disposes the timeout
 */
export function interupt(action: () => void, delay: number): Disposable & { invoke: () => void } {
	let inFlight = false

	let timeout: number | null = null

	const invoke = () => {
		inFlight = true

		if (timeout !== null) {
			clearTimeout(timeout)
		}

		timeout = setTimeout(() => {
			timeout = null

			inFlight = false

			action()
		}, delay)
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
