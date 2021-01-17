/**
 * Reactive vue state for the Sidebar
 */

import Vue from 'vue'
import { SidebarElement } from './create'
// import { trigger } from '../../AppCycle/EventSystem'

export interface SidebarState {
	currentState: string | null
	sidebarElements: Record<string, SidebarElement>
}

export const SidebarState: SidebarState = Vue.observable({
	currentState: null,
	sidebarElements: {},
})

export function selectSidebar(findId: string) {
	const sidebar = Object.values(SidebarState.sidebarElements).find(
		({ uuid }) => uuid === findId
	)

	if (!sidebar) throw new Error(`Sidebar with id "${findId}" not found`)
	sidebar?.click()
}
