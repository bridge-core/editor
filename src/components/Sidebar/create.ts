import { SidebarState, toggle } from './state'
import { v4 as uuid } from 'uuid'
import { Component } from 'vue'
import type { IDisposable } from '/@/types/disposable'
import { App } from '/@/App'
import { SidebarContent } from './Content/SidebarContent'
import { watch, WatchStopHandle } from 'vue'

export interface ISidebar {
	id?: string
	icon?: string
	displayName?: string
	isVisible?: boolean
	component?: Component
	sidebarContent?: SidebarContent
	disabled?: () => boolean

	onClick?: (sidebarElement: SidebarElement) => void
}

export interface SidebarInstance extends IDisposable, ISidebar {
	readonly uuid: string
	readonly isLoading: boolean

	click: () => void
}

/**
 * Creates a new sidebar
 * @param config
 */
export function createSidebar(config: ISidebar) {
	return new SidebarElement(config)
}

export interface IBadge {
	count: number
	color?: string
	icon?: string
	dot?: boolean
}

export class SidebarElement {
	protected sidebarUUID: string
	isLoading = false
	isVisible = true
	isSelected = false
	stopHandle: WatchStopHandle | undefined
	badge: IBadge | null = null

	constructor(protected config: ISidebar) {
		this.sidebarUUID = config.id ?? uuid()
		SidebarState.sidebarElements[this.sidebarUUID] = this
		if (config.isVisible) this.isVisible = config.isVisible

		if (this.config.component) {
			const component = this.config.component

			this.config.sidebarContent = new (class extends SidebarContent {
				protected component = component
				protected actions = undefined
				protected topPanel = undefined
			})()
		}
		this.stopHandle = watch(
			SidebarState,
			() => {
				this.isSelected =
					(SidebarState.currentState ?? false) &&
					SidebarState.currentState === this.config.sidebarContent
			},
			{ deep: false }
		)
	}

	get isDisabled() {
		return this.config.disabled?.() ?? false
	}
	get icon() {
		return this.config.icon
	}
	get uuid() {
		return this.sidebarUUID
	}
	get displayName() {
		return this.config.displayName
	}
	get component() {
		return this.config.component
	}
	dispose() {
		delete SidebarState.sidebarElements[this.sidebarUUID]
		this.stopHandle?.()
		this.stopHandle = undefined
	}
	setSidebarContent(sidebarContent: SidebarContent) {
		this.config.sidebarContent = sidebarContent
	}
	attachBadge(badge: IBadge | null) {
		this.badge = badge

		return this
	}

	async click() {
		this.isLoading = true

		if (this.config.sidebarContent) toggle(this.config.sidebarContent)

		if (typeof this.config.onClick === 'function')
			await this.config.onClick(this)
		this.isLoading = false
	}
}
