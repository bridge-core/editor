import { Component as VueComponent, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import { Signal } from '/@/components/Common/Event/Signal'
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { App } from '/@/App'
import { markRaw } from 'vue'

/**
 * @deprecated Transition window to NewBaseWindow with dedicated window state
 */
export abstract class BaseWindow<T = void> extends Signal<T> {
	protected windowUUID = uuid()
	public isVisible = ref(false)
	protected shouldRender = ref(false)
	protected actions: SimpleAction[] = []
	protected component: VueComponent
	protected closeTimeout: number | null = null

	constructor(
		component: VueComponent,
		protected disposeOnClose = false,
		protected keepAlive = false
	) {
		super()

		this.component = markRaw(component)
	}

	defineWindow() {
		App.windowState.addWindow(this.windowUUID, this)
	}
	addAction(action: SimpleAction) {
		this.actions.push(action)
	}

	close(data: T | null) {
		this.isVisible.value = false
		if (data !== null) this.dispatch(data)

		if (!this.keepAlive) {
			this.closeTimeout = window.setTimeout(() => {
				this.shouldRender.value = false
				this.closeTimeout = null
				if (this.disposeOnClose) this.dispose()
			}, 600)
		}
	}
	open() {
		this.shouldRender.value = true
		this.isVisible.value = true
		this.resetSignal()
		if (this.closeTimeout !== null) {
			window.clearTimeout(this.closeTimeout)
			this.closeTimeout = null
		}
	}
	dispose() {
		App.windowState.deleteWindow(this.windowUUID)
	}
}
