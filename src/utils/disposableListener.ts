export function addListener<K extends keyof DocumentEventMap>(
	type: K,
	listener: (this: Document, ev: DocumentEventMap[K]) => any,
	options?: boolean | AddEventListenerOptions
) {
	document.addEventListener(type, listener, options)

	return {
		dispose: () => document.removeEventListener(type, listener),
	}
}
