import { createSignal } from 'solid-js'

export function createRef<T>(val: T) {
	const [ref, setRef] = createSignal(val)

	return {
		get value() {
			return ref()
		},
		set value(val: T) {
			setRef(() => val)
		},
	}
}
