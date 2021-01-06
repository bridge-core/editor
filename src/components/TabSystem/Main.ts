import { Tab } from './CommonTab'
import WelcomeScreen from './WelcomeScreen.vue'
import { TextTab } from '../Editors/Text/TextTab'
import Vue from 'vue'
import { DirectoryEntry } from '../Sidebar/Content/Explorer/DirectoryEntry'
import { FileSystem } from '@/components/FileSystem/Main'

export class TabSystem {
	tabs: Tab[] = []
	protected _selectedTab: Tab | undefined = undefined

	get selectedTab() {
		return this._selectedTab
	}

	open(path: string, selectTab = true) {
		for (const tab of this.tabs) {
			if (tab.isFor(path)) return selectTab ? tab.select() : tab
		}

		const tab = new TextTab(this, path)
		this.add(tab)
		return selectTab ? tab.select() : tab
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
	closeByPath(path: string) {
		const tab = this.tabs.find(tab => tab.isFor(path))
		if (tab) this.close(tab)
	}
	select(tab?: Tab) {
		this._selectedTab?.onDeactivate()
		this._selectedTab = tab
		Vue.nextTick(() => this._selectedTab?.onActivate())
	}
	save(tab = this.selectedTab) {
		tab?.save()
	}

	getTab(path: string) {
		return this.tabs.find(tab => tab.isFor(path))
	}

	get currentComponent() {
		return this._selectedTab?.component ?? WelcomeScreen
	}

	get hasUnsavedTabs() {
		return this.tabs.some(tab => tab.isUnsaved)
	}
}

export const mainTabSystem = Vue.observable(new TabSystem())
