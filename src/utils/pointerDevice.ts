import { ref } from '@vue/composition-api'

type TPointerType = 'touch' | 'mouse' | 'pen'
export const pointerDevice = ref<TPointerType>('mouse')

window.addEventListener(
	'pointerdown',
	(event) => {
		console.log('POINTER CHANGE', pointerDevice.value)
		pointerDevice.value = <TPointerType>event.pointerType
	},
	{ passive: true }
)
