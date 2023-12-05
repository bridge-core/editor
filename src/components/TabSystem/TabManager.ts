import { Tab } from './Tab'
import { TabSystem } from './TabSystem'

export class TabManager {
	public tabSystems: TabSystem[] = [new TabSystem()]

	public get defaultTabSystem() {
		return this.tabSystems[0]
	}

	public openTab(tab: Tab) {
		this.defaultTabSystem.addTab(tab)
	}
}
