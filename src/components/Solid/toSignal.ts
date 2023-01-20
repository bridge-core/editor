import { Ref, watch, watchEffect } from 'vue'
import { createSignal, onCleanup } from 'solid-js'

export function toSignal<T>(ref: Ref<T>) {
	const [signal, setSignal] = createSignal<T>(ref.value, { equals: false })

	const dispose = watchEffect(() => {
		setSignal(() => ref.value)
	})

	onCleanup(() => {
		dispose()
	})

	return [
		signal,
		(val: T) => {
			ref.value = val
			return val
		},
	] as const
}
