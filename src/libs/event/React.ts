import { onMounted, onUnmounted, shallowRef, ShallowRef } from 'vue'
import { Disposable } from '@/libs/disposeable/Disposeable'
import { Event } from '@/libs/event/Event'

export function createReactable<T>(event: Event<any>, provider: () => T): () => ShallowRef<T> {
	return () => {
		const valueRef: ShallowRef<T> = shallowRef(provider())

		function update() {
			valueRef.value = provider()
		}

		let disposable: Disposable

		onMounted(() => {
			disposable = event.on(update)
		})

		onUnmounted(() => {
			disposable.dispose()
		})

		return valueRef
	}
}
