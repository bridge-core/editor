import { Ref, watch, watchEffect } from 'vue'
import { createSignal, onCleanup } from 'solid-js'

export function toSignal<T>(ref: Ref<T>) {
	const [signal, setSignal] = createSignal<T>(ref.value, { equals: false })

	let userControlledTrigger = false
	const dispose = watchEffect(() => {
		if (userControlledTrigger) {
			userControlledTrigger = false
			// We need to access the value to keep the dep tracker alive
			const _ = ref.value
			return
		}

		setSignal(() => ref.value)
	})

	onCleanup(() => {
		dispose()
	})

	return [
		signal,
		(val: T) => {
			userControlledTrigger = true
			ref.value = val
			return val
		},
	] as const
}
