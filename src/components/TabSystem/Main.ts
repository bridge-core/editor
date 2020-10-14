import { Tab } from './CommonTab'
import WelcomeScreen from './WelcomeScreen.vue'
import { TextTab } from '../Editors/Text/TextTab'
import Vue from 'vue'
import { DirectoryEntry } from '../Sidebar/Content/Explorer/DirectoryEntry'

export class TabSystem {
	tabs: Tab[] = []
	protected _selectedTab: Tab | undefined = undefined

	get selectedTab() {
		return this._selectedTab
	}

	open(directoryEntry: DirectoryEntry) {
		for (const tab of this.tabs) {
			if (tab.isFor(directoryEntry)) return tab.select()
		}

		const tab = new TextTab(this, directoryEntry)
		this.add(tab)
		return tab.select()
	}

	add(tab: Tab) {
		this.tabs = [...this.tabs, tab]
		return tab
	}
	close(tab: Tab) {
		tab.onDeactivate()
		this.tabs = this.tabs.filter(current => current !== tab)
		tab.onDestroy()

		if (this._selectedTab === tab) {
			this.select(this.tabs[0])
		}
	}
	select(tab?: Tab) {
		this._selectedTab?.onDeactivate()
		this._selectedTab = tab
		Vue.nextTick(() => this._selectedTab?.onActivate())
	}
	save() {
		this.selectedTab?.save()
	}

	get currentComponent() {
		return this._selectedTab?.component ?? WelcomeScreen
	}
}

export const mainTabSystem = Vue.observable(new TabSystem())
