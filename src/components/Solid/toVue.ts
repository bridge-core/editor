import { Component } from 'solid-js'
import { Component as VueComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import { render } from 'solid-js/web'
import { SetupContext } from 'vue'

/**
 * An utility function to embed a Solid component into a Vue component.
 */
export function toVue<T>(component: Component<T>): VueComponent {
	const vueWrapper: VueComponent = {
		inheritAttrs: false,
		template: `<div v-once ref="mountRef"></div>`,
		setup(_: any, { slots, attrs }: SetupContext) {
			const mountRef = ref<HTMLElement | null>(null)

			// Hacky solution for getting compat with Vuetify's icons
			// Tries to unwrap default slot into normal string
			let childrenText: string | null = null
			if (typeof slots.default === 'function') {
				const [vnode] = slots.default()
				if (vnode.text) childrenText = vnode.text
			}
			if (childrenText) attrs.children = childrenText

			let dispose: (() => void) | null = null
			onMounted(() => {
				if (!mountRef.value) return

				dispose = render(() => component(attrs as T), mountRef.value)
			})

			onBeforeUnmount(() => {
				if (!dispose) return

				dispose()
				dispose = null
			})

			return {
				mountRef,
			}
		},
	}

	if (import.meta.env.DEV) {
		vueWrapper.name = component.name.replace('_Hot$$', '')
	}

	return vueWrapper
}
