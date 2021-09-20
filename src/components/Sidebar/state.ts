/**
 * Reactive vue state for the Sidebar
 */

import { computed, reactive, ref, watch } from '@vue/composition-api'
import { SidebarContent } from './Content/SidebarContent'
import { SidebarElement } from './create'
import { App } from '/@/App'

export interface SidebarState {
	isNavigationVisible: boolean
	currentState: SidebarContent | null
	sidebarElements: Record<string, SidebarElement>
}

export const SidebarState: SidebarState = reactive({
	isNavigationVisible: true,
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
export function hide() {
	SidebarState.isNavigationVisible = false
	App.getApp().then((app) => app.windowResize.dispatch())
}

export const isContentVisible = ref(false)
watch(
	SidebarState,
	() => {
		isContentVisible.value = SidebarState.currentState !== null
	},
	{ deep: false }
)
