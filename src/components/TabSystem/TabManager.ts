import { ShallowRef, shallowRef } from 'vue'
import { Tab } from './Tab'
import { TabSystem } from './TabSystem'
import { TextTab } from '@/components/Tabs/Text/TextTab'
import { ImageTab } from '../Tabs/Image/ImageTab'
import { FileTab } from './FileTab'

export class TabManager {
	public tabSystems: TabSystem[] = [new TabSystem()]
	public focusedTabSystem: ShallowRef<TabSystem | null> = shallowRef(null)

	private tabTypes: (typeof FileTab)[] = [ImageTab, TextTab]

	public async openTab(tab: Tab) {
		await this.getDefaultTabSystem().addTab(tab)

		this.focusedTabSystem.value = this.getDefaultTabSystem()
	}

	public openFile(path: string) {
		for (const tabSystem of this.tabSystems) {
			for (const tab of tabSystem.tabs.value) {
				if (tab instanceof FileTab && tab.is(path)) {
					tabSystem.selectTab(tab)

					this.focusedTabSystem.value = tabSystem

					return
				}
			}
		}

		for (const TabType of this.tabTypes) {
			if (TabType.canEdit(path)) {
				this.openTab(new TabType(path))

				return
			}
		}
	}

	public getDefaultTabSystem(): TabSystem {
		return this.tabSystems[0]
	}

	public getFocusedTab(): Tab | null {
		if (this.focusedTabSystem.value === null) return null

		return this.focusedTabSystem.value.selectedTab.value
	}
}
