import { Tab } from './CommonTab'
import WelcomeScreen from './WelcomeScreen.vue'
import { TextTab } from '../Editors/Text/TextTab'
import Vue from 'vue'
import { App } from '@/App'
import { ImageTab } from '../Editors/Image/ImageTab'
import { UnsavedFileWindow } from '../Windows/UnsavedFile/UnsavedFile'
import { Project } from '../Projects/Project/Project'

export class TabSystem {
	tabs: Tab[] = []
	protected _selectedTab: Tab | undefined = undefined
	protected tabTypes = [ImageTab, TextTab]

	constructor(protected project: Project) {}

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
				tab.getPath().replace(`projects/${this.project.name}/`, '')
			)

		Vue.nextTick(() => this._selectedTab?.onActivate())
	}
	async save(tab = this.selectedTab) {
		if (!tab) return

		const app = await App.getApp()
		app.windows.loadingWindow.open()

		await tab.save()
		await app.packIndexer.fired
		await app.compiler.fired

		await app.packIndexer.updateFile(
			tab.getPath().replace(`projects/${this.project.name}/`, '')
		)
		await app.compiler.updateFile(
			'dev',
			'default.json',
			tab.getPath().replace(`projects/${this.project.name}/`, '')
		)
		await this.project.recentFiles.add({
			path: tab.getPath(),
			name: tab.name,
			color: tab.iconColor,
			icon: tab.icon,
		})

		// Only refresh auto-completion content if tab is active
		if (tab === this.selectedTab)
			App.eventSystem.dispatch(
				'refreshCurrentContext',
				tab.getPath().replace(`projects/${this.project.name}/`, '')
			)

		app.windows.loadingWindow.close()
	}

	deactivate() {
		this.selectedTab?.onDeactivate()
	}
	activate() {
		this.selectedTab?.onActivate()
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
