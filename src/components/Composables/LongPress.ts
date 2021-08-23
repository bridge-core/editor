/**
 * A function that returns two functions (onTouchStart & onTouchEnd) given a callback that should be run when a user
 * long presses on an element on touch devices
 */
export function useLongPress(
	longPressCallback: () => unknown,
	longPressDuration: number = 500
) {
	let timeoutId: number | null = null

	const onTouchStart = () => {
		// Set a timeout to fire the callback
		timeoutId = window.setTimeout(() => {
			if (longPressCallback) {
				longPressCallback()
			}
		}, longPressDuration)
	}

	const onTouchEnd = () => {
		// Clear the timeout
		if (timeoutId) {
			window.clearTimeout(timeoutId)
		}
	}

	return { onTouchStart, onTouchEnd }
}
