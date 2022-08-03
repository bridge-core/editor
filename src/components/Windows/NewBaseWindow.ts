import { Component as VueComponent } from 'vue'
import { v4 as uuid } from 'uuid'
import { Signal } from '/@/components/Common/Event/Signal'
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { App } from '/@/App'
import { markRaw, reactive } from 'vue'

export interface IWindowState {
	isVisible: boolean
	shouldRender: boolean
	actions: SimpleAction[]
}
export abstract class NewBaseWindow<T = void> extends Signal<T> {
	protected windowUUID = uuid()
	protected component: VueComponent
	protected closeTimeout: number | null = null
	protected state: IWindowState = reactive({
		isVisible: false,
		shouldRender: false,
		actions: [],
	})

	getState() {
		return this.state
	}

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
		this.state.actions.push(action)
	}

	close(data: T | null) {
		this.state.isVisible = false
		if (data !== null) this.dispatch(data)

		if (!this.keepAlive) {
			this.closeTimeout = window.setTimeout(() => {
				this.state.shouldRender = false
				this.closeTimeout = null
				if (this.disposeOnClose) this.dispose()
			}, 600)
		}
	}
	open() {
		this.state.shouldRender = true
		this.state.isVisible = true
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
