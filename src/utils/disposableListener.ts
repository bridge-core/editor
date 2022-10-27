export function addDisposableEventListener(
	event: string,
	listener: (event: any) => void,
	eventTarget: EventTarget = window
) {
	eventTarget.addEventListener(event, listener)

	return {
		dispose: () => {
			eventTarget.removeEventListener(event, listener)
		},
	}
}
