import { disposableTimeout } from './disposableTimeout'

declare const requestIdleCallback:
	| ((cb: () => Promise<void> | void) => number)
	| undefined
declare const cancelIdleCallback: ((handle: number) => void) | undefined

export const supportsIdleCallback = typeof requestIdleCallback === 'function'

export function whenIdle(cb: () => Promise<void> | void) {
	return new Promise<void>((resolve) => {
		if (typeof requestIdleCallback === 'function') {
			requestIdleCallback(async () => {
				await cb()
				resolve()
			})
		} else {
			setTimeout(async () => {
				await cb()
				resolve()
			}, 10)
		}
	})
}

export const whenIdleDisposable = (cb: () => Promise<void> | void) => {
	if (typeof requestIdleCallback !== 'function') {
		return disposableTimeout(cb, 1)
	}

	let callbackId: number | undefined = requestIdleCallback(() => {
		callbackId = undefined
		cb()
	})

	return {
		dispose: () => {
			if (callbackId && typeof cancelIdleCallback === 'function')
				cancelIdleCallback(callbackId)
			callbackId = undefined
		},
	}
}
