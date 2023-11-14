/**
 * A function that scheducles a callback function after x milliseconds.
 * @param callback The callback function to execute.
 * @param milliseconds The number of milliseconds to wait before executing the callback.
 * @returns {IDisposable}
 */
export function disposableTimeout(callback: () => void, milliseconds: number) {
	let timeoutId: number | null
	// setTimeout
	timeoutId = <number>(<unknown>setTimeout(() => {
		timeoutId = null
		callback()
	}, milliseconds))

	return {
		dispose: () => {
			if (timeoutId) clearTimeout(timeoutId)
			timeoutId = null
		},
	}
}
