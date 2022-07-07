import { reactive, ref, del, set, computed } from '@vue/composition-api'
import { SidebarContent } from './Content/SidebarContent'
import { SidebarElement } from './SidebarElement'
import { App } from '/@/App'

export class SidebarManager {
	elements = reactive<Record<string, SidebarElement>>({})
	isNavigationVisible = ref(true)
	currentState = ref<SidebarContent | null>(null)
	isContentVisible = computed(() => this.currentState.value !== null)
	forcedInitialState = ref(false)

	addSidebarElement(uuid: string, element: SidebarElement) {
		set(this.elements, uuid, element)

		return {
			dispose: () => {
				del(this.elements, uuid)
			},
		}
	}

	toggleSidebarContent(content: SidebarContent | null) {
		if (content === null) {
			this.currentState.value = null
			return
		}

		if (content === this.currentState.value) {
			this.currentState.value = null
		} else {
			this.currentState.value = content
			if (!this.isNavigationVisible.value)
				this.isNavigationVisible.value = true
		}

		App.getApp().then((app) => app.windowResize.dispatch())
	}
	selectSidebarContent(content: SidebarContent | null) {
		this.currentState.value = content
		App.getApp().then((app) => app.windowResize.dispatch())
	}
	hide() {
		this.isNavigationVisible.value = false
		App.getApp().then((app) => app.windowResize.dispatch())
	}
}
