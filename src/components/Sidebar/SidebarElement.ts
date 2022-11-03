import { v4 as uuid } from 'uuid'
import { Component } from 'vue'
import type { IDisposable } from '/@/types/disposable'
import { SidebarContent } from './Content/SidebarContent'
import { del, set, watch, WatchStopHandle } from 'vue'
import { settingsState } from '../Windows/Settings/SettingsState'
import { App } from '/@/App'

export interface ISidebar {
	id?: string
	icon?: string
	displayName?: string
	group?: string
	isVisible?: boolean | (() => boolean)
	/**
	 * Change the default visibility setting of the sidebar element
	 */
	defaultVisibility?: boolean
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
	protected disposable: IDisposable
	isLoading = false
	isSelected = false
	stopHandle: WatchStopHandle | undefined
	badge: IBadge | null = null
	isVisibleSetting?: boolean = undefined

	constructor(protected config: ISidebar) {
		this.sidebarUUID = config.id ?? uuid()
		this.disposable = App.sidebar.addSidebarElement(this.sidebarUUID, this)

		if (this.config.component) {
			const component = this.config.component

			this.config.sidebarContent = new (class extends SidebarContent {
				protected component = component
				protected actions = undefined
				protected topPanel = undefined
			})()
		}
		this.stopHandle = watch(
			App.sidebar.currentState,
			() => {
				this.isSelected =
					(App.sidebar.currentState.value ?? false) &&
					App.sidebar.currentState.value ===
						this.config.sidebarContent
			},
			{ deep: false }
		)
	}

	get isDisabled() {
		return this.config.disabled?.() ?? false
	}
	get isVisible() {
		if (typeof this.config.isVisible === 'function')
			return this.config.isVisible()

		return this.config.isVisible ?? !!this.isVisibleSetting
	}
	get defaultVisibility() {
		return this.config.defaultVisibility ?? true
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
	get group() {
		return this.config.group
	}
	get component() {
		return this.config.component
	}
	dispose() {
		this.disposable.dispose()
		this.stopHandle?.()
		this.stopHandle = undefined
	}
	setSidebarContent(sidebarContent: SidebarContent) {
		this.config.sidebarContent = sidebarContent
	}
	setIsVisible(isVisible: boolean | (() => boolean)) {
		this.config.isVisible = isVisible
	}
	attachBadge(badge: IBadge | null) {
		this.badge = badge

		return this
	}

	async click() {
		this.isLoading = true

		if (this.config.sidebarContent)
			App.sidebar.toggleSidebarContent(this.config.sidebarContent)

		if (typeof this.config.onClick === 'function')
			await this.config.onClick(this)
		this.isLoading = false
	}
	select() {
		if (!this.config.sidebarContent)
			throw new Error(
				'Cannot select sidebar element without sidebar content'
			)

		App.sidebar.selectSidebarContent(this.config.sidebarContent)
	}
}
