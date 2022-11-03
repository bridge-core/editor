import { reactive, ref, del, set, computed } from 'vue'
import { SidebarContent } from './Content/SidebarContent'
import { SidebarElement } from './SidebarElement'
import { App } from '/@/App'

export class SidebarManager {
	elements = reactive<Record<string, SidebarElement>>({})
	isNavigationVisible = ref(true)
	currentState = ref<SidebarContent | null>(null)
	isContentVisible = computed(() => this.currentState.value !== null)
	forcedInitialState = ref(false)
	groupOrder = ['projectChooser', 'packExplorer']

	sortedElements = ref<SidebarElement[]>([])

	protected updateSortedElements() {
		this.sortedElements.value = Object.values(this.elements).sort(
			(a, b) => {
				if (!a.group && !b.group) return 0

				if (!a.group) return 1
				if (!b.group) return -1
				return (
					this.groupOrder.indexOf(a.group) -
					this.groupOrder.indexOf(b.group)
				)
			}
		)
	}

	addSidebarElement(uuid: string, element: SidebarElement) {
		set(this.elements, uuid, element)
		this.updateSortedElements()

		return {
			dispose: () => {
				del(this.elements, uuid)
				this.updateSortedElements()
			},
		}
	}

	toggleSidebarContent(content: SidebarContent | null) {
		if (content === null) {
			this.hideSidebarContent()
			return
		}

		if (content === this.currentState.value) {
			this.hideSidebarContent(false)
		} else {
			this.currentState.value = content
			if (!this.isNavigationVisible.value)
				this.isNavigationVisible.value = true
		}

		App.getApp().then((app) => app.windowResize.dispatch())
	}
	async hideSidebarContent(hideNavigation = true) {
		const app = await App.getApp()

		if (app.mobile.isCurrentDevice()) {
			if (hideNavigation) this.isNavigationVisible.value = false
		} else {
			this.currentState.value = null
		}
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
