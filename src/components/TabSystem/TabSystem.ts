import { Tab } from './CommonTab'
import WelcomeScreen from './WelcomeScreen.vue'
import { TextTab } from '../Editors/Text/TextTab'
import Vue from 'vue'
import { App } from '@/App'
import { selectedProject } from '../Project/Loader'
import { ImageTab } from '../Editors/Image/ImageTab'
import { createConfirmWindow } from '../Windows/Common/CommonDefinitions'
import { UnsavedFileWindow } from '../Windows/UnsavedFile/UnsavedFile'

export class TabSystem {
	tabs: Tab[] = []
	protected _selectedTab: Tab | undefined = undefined
	protected tabTypes = [ImageTab, TextTab]

	get selectedTab() {
		return this._selectedTab
	}

	open(path: string, selectTab = true) {
		for (const tab of this.tabs) {
			if (tab.isFor(path)) return selectTab ? tab.select() : tab
		}

		const tab = this.getTabFor(path)
		this.add(tab)
		return selectTab ? tab.select() : tab
	}

	protected getTabFor(filePath: string) {
		for (const CurrentTab of this.tabTypes) {
			if (CurrentTab.is(filePath)) return new CurrentTab(this, filePath)
		}
		return new TextTab(this, filePath)
	}

	add(tab: Tab) {
		this.tabs = [...this.tabs, tab]

		return tab
	}
	close(tab = this.selectedTab, checkUnsaved = true) {
		if (!tab) return

		if (checkUnsaved && tab.isUnsaved) {
			new UnsavedFileWindow(tab)
		} else {
			tab.onDeactivate()
			this.tabs = this.tabs.filter(current => current !== tab)
			tab.onDestroy()

			if (this._selectedTab === tab) {
				this.select(this.tabs[0])
			}
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

		// Only refresh auto-completion content if tab is active
		if (tab === this.selectedTab)
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
