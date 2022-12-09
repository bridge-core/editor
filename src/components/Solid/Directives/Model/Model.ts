import { createRenderEffect, onCleanup, Signal } from 'solid-js'

declare module 'solid-js' {
	namespace JSX {
		interface Directives {
			model: any // Solid directives are impossible to fully type :(
		}
	}
}

/**
 * A Solid equivalent of the v-model directive.
 */
function model<T>(el: HTMLElement, value: (() => Signal<string>) | undefined) {
	const input =
		el instanceof HTMLInputElement ? el : el.querySelector('input')
	if (input === null) throw new Error('No input element found for use:model')

	if (value === undefined) return
	const [field, setField] = value()

	createRenderEffect(() => {
		input.value = field()
	})

	const onInput = (e: Event) => {
		setField(input.value)
	}

	input.addEventListener('input', onInput)

	onCleanup(() => {
		input.removeEventListener('input', onInput)
	})
}

export const useModel = () => model
