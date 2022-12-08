import { computed, watch } from 'vue'
import { settingsState } from '../../Windows/Settings/SettingsState'
import { App } from '/@/App'

export function useSidebarState() {
	const isNavVisible = computed(() => App.sidebar.isNavigationVisible.value)
	const isContentVisible = computed(
		() => isNavVisible && App.sidebar.isContentVisible.value
	)
	const isAttachedRight = computed(
		() => settingsState.sidebar && settingsState.sidebar.isSidebarRight
	)

	return {
		isNavVisible,
		isContentVisible,
		isAttachedRight,
	}
}
