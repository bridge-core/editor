import { Component as VueComponent } from 'vue'
import { v4 as uuid } from 'uuid'
import { Signal } from '/@/components/Common/Event/Signal'
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { App } from '/@/App'
import { del, markRaw, set } from '@vue/composition-api'

export abstract class BaseWindow<T = void> extends Signal<T> {
	protected windowUUID = uuid()
	protected isVisible = false
	protected shouldRender = false
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
		set(App.windowState.state, this.windowUUID, this)
	}
	addAction(action: SimpleAction) {
		this.actions.push(action)
	}

	close(data: T | null) {
		this.isVisible = false
		if (data !== null) this.dispatch(data)

		if (!this.keepAlive) {
			this.closeTimeout = window.setTimeout(() => {
				this.shouldRender = false
				this.closeTimeout = null
				if (this.disposeOnClose) this.dispose()
			}, 600)
		}
	}
	open() {
		this.shouldRender = true
		this.isVisible = true
		this.resetSignal()
		if (this.closeTimeout !== null) {
			window.clearTimeout(this.closeTimeout)
			this.closeTimeout = null
		}
	}
	dispose() {
		del(App.windowState.state, this.windowUUID)
	}
}
