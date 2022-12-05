import { ref, Ref, watch } from 'vue'
import { createSignal, onCleanup } from 'solid-js'

export function toSignal<T>(ref: Ref<T>) {
	const [signal, setSignal] = createSignal<T>(ref.value)

	const dispose = watch(ref, () => {
		setSignal(() => ref.value)
	})

	onCleanup(() => {
		dispose()
	})

	return [
		signal,
		(val: T) => {
			ref.value = val
		},
	] as const
}
