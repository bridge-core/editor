import { Component as VueComponent } from 'vue'
import { v4 as uuid } from 'uuid'
import { App } from '/@/App'
import { shallowReactive, del, set } from 'vue'

export function createWindow(
	vueComponent: VueComponent,
	state: Record<string, unknown> = {},
	disposeOnClose = true,
	onClose = () => {}
) {
	// It might make sense for some windows to be "await"-able. This is a helper for that
	const status: { setDone?: () => void; done?: Promise<void> } = {}
	status.done = new Promise<void>((resolve) => {
		status.setDone = resolve
	})

	const windowUUID = uuid()
	const localState: typeof state = shallowReactive(
		Object.assign(state, {
			isVisible: false,
			shouldRender: false,
		})
	)

	const windowApi = {
		component: vueComponent,
		getState: () => localState,
		close: () => {
			onClose()

			localState.isVisible = false
			setTimeout(() => {
				localState.shouldRender = false
				if (disposeOnClose) windowApi.dispose()
			}, 600)
		},
		open: () => {
			localState.shouldRender = true
			localState.isVisible = true
		},
		dispose: () => del(App.windowState.state, windowUUID),
		status,
		get isVisible() {
			return localState.isVisible
		},
	}

	set(App.windowState.state, windowUUID, windowApi)

	return windowApi
}

export type TWindow = ReturnType<typeof createWindow>
