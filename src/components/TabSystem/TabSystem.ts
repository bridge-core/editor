import { v4 as uuid } from 'uuid'
import { Tab } from './Tab'
import { Ref, ref } from 'vue'

export class TabSystem {
	public id = uuid()
	public tabs: Ref<Tab[]> = ref([])

	public async addTab(tab: Tab) {
		if (this.tabs.value.includes(tab)) return

		this.tabs.value.push(tab)

		await tab.activate()
	}

	public async removeTab(tab: Tab) {
		if (!this.tabs.value.includes(tab)) return

		tab.deactivate()

		this.tabs.value = this.tabs.value.filter(
			(otherTab) => otherTab.id !== tab.id
		)
	}
}
