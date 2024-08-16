import { ref, Ref } from 'vue'

export class Editor {
	public static sideCollapsed: Ref<boolean> = ref(false)

	public static showTabs() {
		this.sideCollapsed.value = true
	}

	public static hideTabs() {
		this.sideCollapsed.value = false
	}
}
