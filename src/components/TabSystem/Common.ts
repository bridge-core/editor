import Vue from 'vue'
import { DirectoryEntry } from '@/components/Sidebar/Content/Explorer/DirectoryEntry'
import WelcomeScreen from './WelcomeScreen.vue'
import { v4 as uuid } from 'uuid'

export abstract class Tab {
	abstract component: Vue.Component
	uuid = uuid()

	constructor(
		protected parent: TabSystem,
		protected directoryEntry: DirectoryEntry
	) {}

	get name() {
		console.log(this.directoryEntry)
		return this.directoryEntry.name
	}

	get isSelected() {
		return this.parent.selectedTab === this
	}
	select() {
		this.parent.select(this)
		return this
	}

	onActivate() {}
	onDeactivate() {}
	onDestroy() {}
}

export class TabSystem {
	tabs: Tab[] = []
	protected _selectedTab: Tab | undefined

	get selectedTab() {
		return this._selectedTab
	}

	add(tab: Tab) {
		this.tabs.push(tab)
	}
	select(tab: Tab) {
		this._selectedTab?.onDeactivate()
		this._selectedTab = tab
		this._selectedTab.onActivate()
	}

	getCurrentComponent() {
		console.log(this.selectedTab, this.tabs)
		return this.selectedTab?.component ?? WelcomeScreen
	}
}

export const mainTabSystem = Vue.observable(new TabSystem())
