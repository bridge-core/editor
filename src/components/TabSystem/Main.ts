import { Tab } from './CommonTab'
import WelcomeScreen from './WelcomeScreen.vue'
import { TextTab } from '../Editors/Text/TextTab'
import Vue from 'vue'
import { DirectoryEntry } from '../Sidebar/Content/Explorer/DirectoryEntry'
import { peerState } from '@/appCycle/remote/Peer'
import { dispatchEvent, dispatchRemoteAction } from '@/appCycle/remote/Client'
import { FileSystem } from '@/fileSystem/Main'

export class TabSystem {
	tabs: Tab[] = []
	protected _selectedTab: Tab | undefined = undefined

	onJoinHost() {
		if (!peerState.isHost) {
			;(dispatchRemoteAction('tabSystem', 'getCurrentTabs') as Promise<
				string[][]
			>).then(async filesToOpen => {
				filesToOpen.forEach(filePath =>
					this.open(filePath, false, false)
				)
				this.tabs[0]?.select()
			})
		}
	}

	get selectedTab() {
		return this._selectedTab
	}

	open(path: string[], selectTab = true, dispatchRemoteEvent = true) {
		for (const tab of this.tabs) {
			if (tab.isFor(path)) return selectTab ? tab.select() : tab
		}

		const tab = new TextTab(this, path)
		this.add(tab, dispatchRemoteEvent)
		return selectTab ? tab.select() : tab
	}

	add(tab: Tab, dispatchRemoteEvent = true) {
		this.tabs = [...this.tabs, tab]

		if (dispatchRemoteEvent)
			dispatchEvent('tabSystem', 'openFile', tab.getPath())

		return tab
	}
	close(tab: Tab, dispatchRemoteEvent = true) {
		tab.onDeactivate()
		this.tabs = this.tabs.filter(current => current !== tab)
		tab.onDestroy()

		if (dispatchRemoteEvent)
			dispatchEvent('tabSystem', 'closeTab', tab.getPath())

		if (this._selectedTab === tab) {
			this.select(this.tabs[0])
		}
	}
	closeByPath(path: string[], dispatchRemoteEvent = true) {
		const tab = this.tabs.find(tab => tab.isFor(path))
		if (tab) this.close(tab, dispatchRemoteEvent)
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
