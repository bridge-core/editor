import { Tab } from './CommonTab'
import WelcomeScreen from './WelcomeScreen.vue'
import { TextTab } from '../Editors/Text/TextTab'
import Vue from 'vue'
import { App } from '/@/App'
import { UnsavedFileWindow } from '../Windows/UnsavedFile/UnsavedFile'
import { Project } from '../Projects/Project/Project'
import { OpenedFiles } from './OpenedFiles'
import { v4 as uuid } from 'uuid'
import { MonacoHolder } from './MonacoHolder'
import { FileTab } from './FileTab'
import { TabProvider } from './TabProvider'

export class TabSystem extends MonacoHolder {
	protected uuid = uuid()
	public tabs: Tab[] = []
	protected _selectedTab: Tab | undefined = undefined
	protected get tabTypes() {
		return TabProvider.tabs
	}
	protected _isActive = true
	public readonly openedFiles: OpenedFiles

	get isActive() {
		return this._isActive
	}
	get shouldRender() {
		return this.tabs.length > 0
	}
	get app() {
		return this._app
	}

	get isSharingScreen() {
		const other = this.project.tabSystems.find(
			(tabSystem) => tabSystem !== this
		)

		return other?.shouldRender
	}
	get hasUnsavedTabs() {
		return this.tabs.some((tab) => tab.isUnsaved)
	}

	constructor(protected project: Project, id = 0) {
		super(project.app)

		this.openedFiles = new OpenedFiles(
			this,
			project.app,
			`projects/${project.name}/.bridge/openedFiles_${id}.json`
		)
	}

	get selectedTab() {
		return this._selectedTab
	}
	get currentComponent() {
		return this._selectedTab?.component ?? WelcomeScreen
	}
	get projectRoot() {
		return this.project.baseDirectory
	}
	get projectName() {
		return this.project.name
	}

	async open(fileHandle: FileSystemFileHandle, selectTab = true) {
		for (const tab of this.tabs) {
			if (await tab.isFor(fileHandle))
				return selectTab ? tab.select() : tab
		}

		const tab = await this.getTabFor(fileHandle)
		await this.add(tab, selectTab)
		return tab
	}
	async openPath(path: string, selectTab = true) {
		const fileHandle = await this.project.app.fileSystem.getFileHandle(path)
		return await this.open(fileHandle, selectTab)
	}

	protected async getTabFor(fileHandle: FileSystemFileHandle) {
		let tab: Tab | undefined = undefined
		for (const CurrentTab of this.tabTypes) {
			if (await CurrentTab.is(fileHandle)) {
				// @ts-ignore
				tab = new CurrentTab(this, fileHandle)
				break
			}
		}
		// Default tab type: Text editor
		if (!tab) tab = new TextTab(this, fileHandle)

		return await tab.fired
	}

	async add(tab: Tab, selectTab = true) {
		if (!tab.hasFired) await tab.fired

		this.tabs = [...this.tabs, tab]
		if (!tab.isForeignFile) await this.openedFiles.add(tab.getPath())

		if (selectTab) tab.select()

		return tab
	}
	remove(tab: Tab, destroyEditor = true) {
		tab.onDeactivate()
		const tabIndex = this.tabs.findIndex((current) => current === tab)
		if (tabIndex === -1) return

		this.tabs.splice(tabIndex, 1)
		if (destroyEditor) tab.onDestroy()

		if (tab === this._selectedTab)
			this.select(this.tabs[tabIndex === 0 ? 0 : tabIndex - 1])
		if (!tab.isForeignFile) this.openedFiles.remove(tab.getPath())

		return tab
	}
	async close(tab = this.selectedTab, checkUnsaved = true) {
		if (!tab) return false

		if (checkUnsaved && tab.isUnsaved) {
			const unsavedWin = new UnsavedFileWindow(tab)

			return (await unsavedWin.fired) !== 'cancel'
		} else {
			this.remove(tab)
			return true
		}
	}
	async closeByPath(fileHandle: FileSystemFileHandle) {
		const tab = await this.getTab(fileHandle)
		if (tab) this.close(tab)
	}
	select(tab?: Tab) {
		if (this.isActive !== !!tab) this.setActive(!!tab)

		if (tab?.isSelected) return

		this._selectedTab?.onDeactivate()
		if (tab && tab !== this._selectedTab && tab instanceof FileTab) {
			App.eventSystem.dispatch('currentTabSwitched', tab.getProjectPath())
		}
		this._selectedTab = tab

		// Next step doesn't need to be done if we simply unselect tab
		if (!tab) return

		Vue.nextTick(async () => {
			await this._selectedTab?.onActivate()
			this._monacoEditor?.layout()
		})
	}
	async save(tab = this.selectedTab) {
		if (!tab) return

		const app = await App.getApp()
		app.windows.loadingWindow.open()

		await tab.save()

		if (!tab.isForeignFile && tab instanceof FileTab) {
			await this.project.updateFile(tab.getProjectPath())

			await this.project.recentFiles.add({
				path: tab.getPath(),
				name: tab.name,
				color: tab.iconColor,
				icon: tab.icon,
			})

			this.project.fileSave.dispatch(
				tab.getProjectPath(),
				await tab.getFile()
			)
		}

		// Only refresh auto-completion content if tab is active
		if (tab === this.selectedTab && tab instanceof FileTab)
			App.eventSystem.dispatch(
				'refreshCurrentContext',
				tab.getProjectPath()
			)

		app.windows.loadingWindow.close()
		tab.focus()
	}

	async activate() {
		await this.openedFiles.ready.fired

		if (this.tabs.length > 0) this.setActive(true)

		if (!this.selectedTab && this.tabs.length > 0) this.tabs[0].select()

		await this.selectedTab?.onActivate()
	}
	deactivate() {
		this.selectedTab?.onDeactivate()
		this.dispose()
	}

	setActive(isActive: boolean, updateProject = true) {
		if (updateProject) this.project.setActiveTabSystem(this, !isActive)
		if (isActive === this._isActive) return

		this._isActive = isActive

		if (isActive && this._selectedTab instanceof FileTab) {
			App.eventSystem.dispatch(
				'currentTabSwitched',
				this._selectedTab?.getProjectPath()
			)
		}
	}

	async getTab(fileHandle: FileSystemFileHandle) {
		for (const tab of this.tabs) {
			if (await tab.isFor(fileHandle)) return tab
		}
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
}
