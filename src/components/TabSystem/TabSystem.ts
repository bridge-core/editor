import { Tab } from './CommonTab'
import WelcomeScreen from './WelcomeScreen.vue'
import { TextTab } from '../Editors/Text/TextTab'
import Vue from 'vue'
import { App } from '@/App'
import { ImageTab } from '../Editors/Image/ImageTab'
import { UnsavedFileWindow } from '../Windows/UnsavedFile/UnsavedFile'
import { Project } from '../Projects/Project/Project'
import { OpenedFiles } from './OpenedFiles'
import { v4 as uuid } from 'uuid'
export class TabSystem {
	protected uuid = uuid()
	public tabs: Tab[] = []
	protected _selectedTab: Tab | undefined = undefined
	protected tabTypes = [ImageTab, TextTab]
	protected _isActive = true
	public readonly openedFiles: OpenedFiles

	get isActive() {
		return this._isActive
	}
	get shouldRender() {
		return this.tabs.length > 0
	}

	constructor(protected project: Project, id = 0) {
		this.openedFiles = new OpenedFiles(
			this,
			project.app,
			`projects/${project.name}/bridge/openedFiles_${id}.json`
		)
	}

	get selectedTab() {
		return this._selectedTab
	}

	open(path: string, selectTab = true) {
		for (const tab of this.tabs) {
			if (tab.isFor(path)) return selectTab ? tab.select() : tab
		}

		const tab = this.getTabFor(path)
		this.add(tab, selectTab)
		return tab
	}

	protected getTabFor(filePath: string) {
		for (const CurrentTab of this.tabTypes) {
			if (CurrentTab.is(filePath)) return new CurrentTab(this, filePath)
		}
		return new TextTab(this, filePath)
	}

	add(tab: Tab, selectTab = true) {
		this.tabs = [...this.tabs, tab]
		this.openedFiles.add(tab.getPath())

		if (selectTab) tab.select()

		return tab
	}
	remove(tab: Tab, destroyEditor = true) {
		tab.onDeactivate()
		this.tabs = this.tabs.filter(current => current !== tab)
		if (destroyEditor) tab.onDestroy()

		if (tab === this._selectedTab) this.select(this.tabs[0])
		this.openedFiles.remove(tab.getPath())

		return tab
	}
	close(tab = this.selectedTab, checkUnsaved = true) {
		if (!tab) return

		if (checkUnsaved && tab.isUnsaved) {
			new UnsavedFileWindow(tab)
		} else {
			this.remove(tab)
		}
	}
	closeByPath(path: string) {
		const tab = this.tabs.find(tab => tab.isFor(path))
		if (tab) this.close(tab)
	}
	select(tab?: Tab) {
		this._selectedTab?.onDeactivate()
		this._selectedTab = tab

		this.setActive(!!tab)

		// Next step doesn't need to be done if we simply unselect tab
		if (!tab) return

		Vue.nextTick(() => this._selectedTab?.onActivate())
	}
	async save(tab = this.selectedTab) {
		if (!tab) return

		const app = await App.getApp()
		app.windows.loadingWindow.open()

		await tab.save()

		await this.project.updateFile(
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

	activate() {
		this.selectedTab?.onActivate()
	}
	deactivate() {
		this.selectedTab?.onDeactivate()
	}

	setActive(isActive: boolean, updateProject = true) {
		if (updateProject) this.project.setActiveTabSystem(this, !isActive)
		this._isActive = isActive

		if (isActive) {
			App.eventSystem.dispatch(
				'currentTabSwitched',
				this._selectedTab?.getPackPath()
			)
		}
	}

	getTab(path: string) {
		return this.tabs.find(tab => tab.isFor(path))
	}
	closeTabs(predicate: (tab: Tab) => boolean) {
		const tabs = [...this.tabs].reverse()

		for (const tab of tabs) {
			if (predicate(tab)) tab.close()
		}
	}
	has(predicate: (tab: Tab) => boolean) {
		for (const tab of this.tabs) {
			if (predicate(tab)) return true
		}
		return true
	}

	get currentComponent() {
		return this._selectedTab?.component ?? WelcomeScreen
	}

	get hasUnsavedTabs() {
		return this.tabs.some(tab => tab.isUnsaved)
	}
}
