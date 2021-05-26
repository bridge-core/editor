import { SidebarState } from './state'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'
import type { IDisposable } from '/@/types/disposable'
import { createOldSidebarCompatWindow } from '/@/components/Windows/OldSidebarCompat/OldSidebarCompat'
import { App } from '/@/App'

export interface ISidebar {
	id?: string
	icon?: string
	displayName?: string
	component?: Vue.Component | string

	onClick?: () => void
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

export class SidebarElement {
	protected sidebarUUID = uuid()
	isLoading = false

	constructor(protected config: ISidebar) {
		Vue.set(SidebarState.sidebarElements, this.sidebarUUID, this)
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
		Vue.delete(SidebarState.sidebarElements, this.sidebarUUID)
	}
	async click() {
		App.audioManager.playAudio('click5.ogg', 1)
		this.isLoading = true
		if (typeof this.config.onClick === 'function')
			await this.config.onClick()
		else if (this.config.component) createOldSidebarCompatWindow(this)
		this.isLoading = false
	}
}
