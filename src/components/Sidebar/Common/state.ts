/**
 * Reactive vue state for the Sidebar
 */

import Vue from 'vue'
import { SidebarInstance } from './create'
// import { trigger } from '../../AppCycle/EventSystem'

export interface SidebarState {
	currentState: string | null
	sidebarElements: Record<string, SidebarInstance>
}

export const SidebarState: SidebarState = Vue.observable({
	currentState: null,
	sidebarElements: {},
})

export function selectSidebar(findId: string) {
	const sidebar = Object.values(SidebarState.sidebarElements).find(
		({ id }) => id === findId
	)
	//Disable once AppCycle is available
	if (sidebar) sidebar.select()

	// if (sidebar && sidebar !== getSelected()) {
	// 	trigger('bridge:toggledSidebar', getSelected(), sidebar.select(), false)
	// }
}

export function getSelected() {
	if (SidebarState.currentState === null) return
	return SidebarState.sidebarElements[SidebarState.currentState]
}
