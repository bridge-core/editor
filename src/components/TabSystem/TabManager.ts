import { Tab } from './Tab'
import { TabSystem } from './TabSystem'
import { TextTab } from '@/components/Tabs/Text/TextTab'

export class TabManager {
	public tabSystems: TabSystem[] = [new TabSystem()]

	public get defaultTabSystem() {
		return this.tabSystems[0]
	}

	public openTab(tab: Tab) {
		this.defaultTabSystem.addTab(tab)
	}

	public openFile(path: string) {
		for (const tabSystem of this.tabSystems) {
			for (const tab of tabSystem.tabs.value) {
				if (tab instanceof TextTab) {
					if (tab.path === path) {
						return
					}
				}
			}
		}

		this.openTab(new TextTab(path))
	}
}
