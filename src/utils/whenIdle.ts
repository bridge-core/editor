declare const requestIdleCallback:
	| ((cb: () => Promise<void> | void) => number)
	| undefined

export function whenIdle(cb: () => Promise<void> | void) {
	return new Promise<void>(async resolve => {
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
