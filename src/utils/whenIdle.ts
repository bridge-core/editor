declare const requestIdleCallback:
	| ((cb: () => Promise<void> | void) => number)
	| undefined
declare const cancelIdleCallback: ((handle: number) => void) | undefined

export function whenIdle(cb: () => Promise<void> | void) {
	return new Promise<void>(async (resolve) => {
		if (typeof requestIdleCallback === 'function') {
			requestIdleCallback(async () => {
				await cb()
				resolve()
			})
		} else {
			await cb()
			resolve()
		}
	})
}

export const whenIdleDisposable = (cb: () => Promise<void> | void) => {
	if (typeof requestIdleCallback !== 'function') {
		cb()
		return { dispose: () => {} }
	}

	let callbackId: number | undefined = requestIdleCallback(() => {
		callbackId = undefined
		cb()
	})

	return {
		dispose: () => {
			if (callbackId && typeof cancelIdleCallback === 'function')
				cancelIdleCallback(callbackId)
		},
	}
}
