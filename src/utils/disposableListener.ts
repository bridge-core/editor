export function addDisposableEventListener(
	event: string,
	listener: (event: any) => void
) {
	window.addEventListener(event, listener)

	return {
		dispose: () => {
			window.removeEventListener(event, listener)
		},
	}
}
