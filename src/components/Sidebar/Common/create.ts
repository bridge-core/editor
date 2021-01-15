import { SidebarState } from './state'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'
import type { IDisposable } from '@/types/disposable'
import { createOldSidebarCompatWindow } from '@/components/Windows/OldSidebarCompat/OldSidebarCompat'

export interface ISidebar {
	id?: string
	icon?: string
	displayName?: string
	component?: Vue.Component | string

	onClick?: () => void
}

export interface SidebarInstance extends IDisposable, ISidebar {
	readonly uuid: string
	readonly isSelected: boolean
	readonly opacity: number

	click: () => void
}

/**
 * Creates a new sidebar
 * @param config
 */
export function createSidebar(config: ISidebar): SidebarInstance {
	const sidebarUUID = uuid()

	const sidebar = {
		...config,
		get uuid() {
			return sidebarUUID
		},
		get isSelected() {
			return SidebarState.currentState === sidebarUUID
		},
		get opacity(): number {
			return this.isSelected ? 1 : 0.25
		},
		dispose() {
			Vue.delete(SidebarState.sidebarElements, sidebarUUID)
		},

		click() {
			if(typeof config.onClick === "function") config.onClick()
			else if(config.component) createOldSidebarCompatWindow(sidebar)
		},

	}

	Vue.set(SidebarState.sidebarElements, sidebarUUID, sidebar)
	return sidebar
}
