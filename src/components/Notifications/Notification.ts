import { NotificationStore } from './state'
import { v4 as uuid } from 'uuid'
import { del, set } from '@vue/composition-api'

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
	protected _isVisible: boolean

	constructor(protected config: INotificationConfig) {
		this._isVisible = this.config.isVisible ?? true

		set(NotificationStore, this.id, this)

		if (this._isVisible) this.updateAppBadge()
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
	get isVisible() {
		return this._isVisible
	}
	//#endregion

	onClick() {
		if (typeof this.config.onClick === 'function') this.config.onClick()
	}
	onMiddleClick() {
		this.config.onMiddleClick?.()
		if (this.config.disposeOnMiddleClick) del(NotificationStore, this.id)
	}

	addClickHandler(cb: () => void) {
		this.config.onClick = cb
	}

	show() {
		if (!this._isVisible) this.updateAppBadge()
		this._isVisible = true
	}

	dispose() {
		del(NotificationStore, this.id)

		this.updateAppBadge()
	}

	protected updateAppBadge() {
		// @ts-expect-error
		if (typeof navigator.setAppBadge === 'function')
			// @ts-expect-error
			navigator.setAppBadge(
				Object.values(NotificationStore).filter(
					({ isVisible }) => isVisible
				).length
			)
	}
}
