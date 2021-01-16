import { Component as VueComponent } from 'vue'
import Vue from 'vue'
import { v4 as uuid } from 'uuid'
import { WINDOWS } from './create'

export abstract class BaseWindow {
	protected windowUUID = uuid()
	protected isVisible = false
	protected shouldRender = false

	constructor(
		protected component: VueComponent,
		protected disposeOnClose = true,
		protected keepAlive = false
	) {}

	defineWindow() {
		Vue.set(WINDOWS, this.windowUUID, this)
	}

	/**
	 * Used so that windows extending this class can
	 * easily hook into the closing window process
	 */
	onClose() {}

	close() {
		this.onClose()

		this.isVisible = false

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
	}
	dispose() {
		Vue.delete(WINDOWS, this.windowUUID)
	}
}
