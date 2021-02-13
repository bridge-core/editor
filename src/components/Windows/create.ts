import { Component as VueComponent } from 'vue'
import Vue from 'vue'
import { v4 as uuid } from 'uuid'

export const WINDOWS = Vue.observable({})

export function createWindow(
	vueComponent: VueComponent,
	state: Record<string, unknown> = {},
	disposeOnClose = true,
	onClose = () => {}
) {
	// It might make sense for some windows to be "await"-able. This is a helper for that
	const status: { setDone?: () => void; done?: Promise<void> } = {}
	status.done = new Promise<void>(resolve => {
		status.setDone = resolve
	})

	const windowUUID = uuid()
	const windowState: typeof state = Vue.observable(
		Object.assign(state, {
			isVisible: false,
			shouldRender: false,
		})
	)

	const windowApi = {
		component: vueComponent,
		getState: () => windowState,
		close: () => {
			onClose()

			windowState.isVisible = false
			setTimeout(() => {
				windowState.shouldRender = false
				if (disposeOnClose) windowApi.dispose()
			}, 600)
		},
		open: () => {
			windowState.shouldRender = true
			windowState.isVisible = true
		},
		dispose: () => Vue.delete(WINDOWS, windowUUID),
		status,
	}

	Vue.set(WINDOWS, windowUUID, windowApi)

	return windowApi
}

export type TWindow = ReturnType<typeof createWindow>
