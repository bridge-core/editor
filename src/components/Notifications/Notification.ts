import { NotificationStore } from './state'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'

export interface INotificationConfig {
	icon?: string
	message?: string
	color?: string
	textColor?: string
	disposeOnMiddleClick?: boolean
	isVisible?: boolean

	onClick?: () => void
	onMiddleClick?: () => void
}

export class Notification {
	protected id = uuid()
	protected isVisible: boolean

	constructor(protected config: INotificationConfig) {
		this.isVisible = this.config.isVisible ?? true

		Vue.set(NotificationStore, this.id, this)

		// @ts-expect-error
		if (typeof navigator.setAppBadge === 'function')
			// @ts-expect-error
			navigator.setAppBadge(Object.keys(NotificationStore).length)
	}

	//#region Config getters
	get icon() {
		return this.config.icon
	}
	get message() {
		return this.config.message
	}
	get color() {
		return this.config.color
	}
	get textColor() {
		return this.config.textColor
	}
	//#endregion

	onClick() {
		if (typeof this.config.onClick === 'function') this.config.onClick()
	}
	onMiddleClick() {
		this.config.onMiddleClick?.()
		if (this.config.disposeOnMiddleClick)
			Vue.delete(NotificationStore, this.id)
	}

	addClickHandler(cb: () => void) {
		this.config.onClick = cb
	}

	show() {
		this.isVisible = true
	}

	dispose() {
		Vue.delete(NotificationStore, this.id)

		// @ts-expect-error
		if (typeof navigator.setAppBadge === 'function')
			// @ts-expect-error
			navigator.setAppBadge(Object.keys(NotificationStore).length)
	}
}
