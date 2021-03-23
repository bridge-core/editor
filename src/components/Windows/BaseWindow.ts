import { Component as VueComponent } from 'vue'
import Vue from 'vue'
import { v4 as uuid } from 'uuid'
import { WINDOWS } from './create'
import { Signal } from '/@/components/Common/Event/Signal'

export abstract class BaseWindow<T = void> extends Signal<T> {
	protected windowUUID = uuid()
	protected isVisible = false
	protected shouldRender = false

	constructor(
		protected component: VueComponent,
		protected disposeOnClose = false,
		protected keepAlive = false
	) {
		super()
	}

	defineWindow() {
		Vue.set(WINDOWS, this.windowUUID, this)
	}

	close(data: T) {
		this.isVisible = false
		this.dispatch(data)

		if (!this.keepAlive) {
			setTimeout(() => {
				this.shouldRender = false
				if (this.disposeOnClose) this.dispose()
			}, 600)
		}
	}
	open() {
		this.shouldRender = true
		this.isVisible = true
		this.resetSignal()
	}
	dispose() {
		Vue.delete(WINDOWS, this.windowUUID)
	}
}
