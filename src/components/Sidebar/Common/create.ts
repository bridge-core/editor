import { SidebarState, getSelected } from './state'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'
import type { Disposable } from '@/types/disposable'
// import { trigger } from '../../AppCycle/EventSystem'
import { getDefaultSidebar } from '../setup'

export interface Sidebar {
	id?: string
	icon?: string
	displayName?: string
	component?: Vue.Component | string

	onClick?: () => void
}

export interface SidebarInstance extends Disposable, Sidebar {
	readonly uuid: string
	readonly isSelected: boolean
	readonly opacity: number

	select: () => SidebarInstance
	toggle: () => void
}

/**
 * Creates a new sidebar
 * @param config
 */
export function createSidebar(config: Sidebar): SidebarInstance {
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
			if (this.isSelected) getDefaultSidebar().select()
			Vue.delete(SidebarState.sidebarElements, sidebarUUID)
		},

		select() {
			const prevSelected = getSelected()
			SidebarState.currentState = sidebarUUID

			// if (prevSelected !== this)
			// 	trigger('bridge:toggledSidebar', prevSelected, this)
			return this
		},
		toggle() {
			if (this.isSelected) {
				// trigger('bridge:onSidebarVisibilityChange', false)
				SidebarState.currentState = null

				// trigger('bridge:toggledSidebar', this, null)
			} else {
				// if (SidebarState.currentState === null)
				// 	trigger('bridge:onSidebarVisibilityChange', true)
				this.select()
			}
			return this
		},
	}

	Vue.set(SidebarState.sidebarElements, sidebarUUID, sidebar)
	return sidebar
}
