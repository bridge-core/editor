import { v4 as uuid } from 'uuid'
import { Tab } from './Tab'
import { Ref, ref, shallowRef } from 'vue'

export class TabSystem {
	public id = uuid()
	// Monaco editor freezes browser when made deep reactive, so instead we make it shallow reactive
	public tabs: Ref<Tab[]> = shallowRef([])
	public selectedTab: Ref<Tab | null> = shallowRef(null)

	public async addTab(tab: Tab, select = true) {
		if (this.tabs.value.includes(tab)) {
			if (select) await this.selectTab(tab)

			return
		}

		await tab.setupTab()

		this.tabs.value.push(tab)

		if (select) await this.selectTab(tab)
	}

	public async selectTab(tab: Tab) {
		if (this.selectedTab.value === tab) return

		if (this.selectedTab.value !== null) await this.selectedTab.value.deactivate()

		this.selectedTab.value = tab

		await tab.activate()
	}

	public async removeTab(tab: Tab) {
		if (!this.tabs.value.includes(tab)) return

		if (this.selectedTab.value === tab) await tab.deactivate()

		this.selectedTab.value = null

		const tabIndex = this.tabs.value.indexOf(tab)

		this.tabs.value.splice(tabIndex, 1)

		if (this.tabs.value.length != 0) await this.selectTab(this.tabs.value[Math.max(tabIndex - 1, 0)])

		await tab.destroy()
	}
}
