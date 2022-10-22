export function addDisposableEventListener(
	event: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
) {
	window.addEventListener(event, listener, options)

	return {
		dispose: () => {
			window.removeEventListener(event, listener)
		},
	}
}
