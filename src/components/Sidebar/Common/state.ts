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
