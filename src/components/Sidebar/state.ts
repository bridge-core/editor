/**
 * Reactive vue state for the Sidebar
 */

import { computed, reactive } from '@vue/composition-api'
import { SidebarContent } from './Content/SidebarContent'
import { SidebarElement } from './create'
import { App } from '/@/App'

export interface SidebarState {
	currentState: SidebarContent | null
	sidebarElements: Record<string, SidebarElement>
}

export const SidebarState: SidebarState = reactive({
	currentState: null,
	sidebarElements: {},
})

export function toggle(content: SidebarContent) {
	if (content === SidebarState.currentState) {
		SidebarState.currentState = null
	} else {
		SidebarState.currentState = content
	}

	App.getApp().then((app) => app.windowResize.dispatch())
}

export const isContentVisible = computed(() => {
	return SidebarState.currentState !== null
})
