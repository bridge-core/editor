import { Tab } from './CommonTab'
import WelcomeScreen from './WelcomeScreen.vue'
import { TextTab } from '../Editors/Text/TextTab'
import Vue from 'vue'
import { App } from '@/App'
import { selectedProject } from '../Project/Loader'

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
		if (tab)
			App.eventSystem.dispatch(
				'currentTabSwitched',
				tab.getPath().replace(`projects/${selectedProject}/`, '')
			)

		Vue.nextTick(() => this._selectedTab?.onActivate())
	}
	async save(tab = this.selectedTab) {
		if (!tab) return

		const app = await App.getApp()
		app.windows.loadingWindow.open()

		await tab.save()

		await app.packIndexer.updateFile(
			tab.getPath().replace(`projects/${selectedProject}/`, '')
		)
		await app.compiler.updateFile(
			'dev',
			'default.json',
			tab.getPath().replace(`projects/${selectedProject}/`, '')
		)
		App.eventSystem.dispatch(
			'refreshCurrentContext',
			tab.getPath().replace(`projects/${selectedProject}/`, '')
		)

		app.windows.loadingWindow.close()
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
