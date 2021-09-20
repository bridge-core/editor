/**
 * A function that returns two functions (onTouchStart & onTouchEnd) given a callback that should be run when a user
 * long presses on an element on touch devices
 */
export function useLongPress(
	longPressCallback: (...args: any[]) => unknown,
	shortPressCallback?: (...args: any[]) => unknown,
	touchEndCallback?: (...args: any[]) => unknown,
	longPressDuration: number = 500
) {
	let timeoutId: number | null = null

	const onTouchStart = (...args: any[]) => {
		// Set a timeout to fire the callback
		timeoutId = window.setTimeout(() => {
			longPressCallback(...args)
			timeoutId = null
		}, longPressDuration)
	}

	const onTouchEnd = () => {
		// Clear the timeout
		if (timeoutId) {
			window.clearTimeout(timeoutId)
			timeoutId = null
			shortPressCallback?.()
		}
		touchEndCallback?.()
	}

	return { onTouchStart, onTouchEnd }
}
