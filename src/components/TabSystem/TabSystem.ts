import { v4 as uuid } from 'uuid'
import { Tab } from './Tab'
import { Ref, ref } from 'vue'

export class TabSystem {
	public id = uuid()
	public tabs: Ref<Tab[]> = ref([])

	public selectedTab: Ref<Tab | null> = ref(null)

	public async addTab(tab: Tab, select = true) {
		if (this.tabs.value.includes(tab)) {
			if (select) await this.selectTab(tab)

			return
		}

		this.tabs.value.push(tab)

		if (select) await this.selectTab(tab)

		await tab.setup()
	}

	public async selectTab(tab: Tab) {
		if (this.selectedTab.value === tab) return

		if (this.selectedTab.value !== null)
			await this.selectedTab.value.deactivate()

		this.selectedTab.value = tab

		await tab.activate()
	}

	public async removeTab(tab: Tab) {
		if (!this.tabs.value.includes(tab)) return

		if (this.selectedTab.value === tab) await tab.deactivate()

		this.selectedTab.value = null

		tab.destroy()

		const tabIndex = this.tabs.value.indexOf(tab)

		this.tabs.value.splice(tabIndex, 1)

		if (this.tabs.value.length == 0) return

		await this.selectTab(this.tabs.value[Math.max(tabIndex - 1, 0)])
	}
}
