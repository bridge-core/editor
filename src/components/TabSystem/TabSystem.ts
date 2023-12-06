import { v4 as uuid } from 'uuid'
import { Tab } from './Tab'
import { Ref, ref } from 'vue'

export class TabSystem {
	public id = uuid()
	public tabs: Ref<Tab[]> = ref([])

	public addTab(tab: Tab) {
		this.tabs.value.push(tab)

		console.log(this.tabs.value)
	}

	public removeTab(tab: Tab) {
		this.tabs.value = this.tabs.value.filter(
			(otherTab) => otherTab.id !== tab.id
		)
	}
}
