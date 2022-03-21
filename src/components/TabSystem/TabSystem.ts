import { Tab } from './CommonTab'
import WelcomeScreen from './WelcomeScreen.vue'
import { TextTab } from '../Editors/Text/TextTab'
import { nextTick } from 'vue'
import { App } from '/@/App'
import { UnsavedFileWindow } from '../Windows/UnsavedFile/UnsavedFile'
import { Project } from '../Projects/Project/Project'
import { OpenedFiles } from './OpenedFiles'
import { v4 as uuid } from 'uuid'
import { MonacoHolder } from './MonacoHolder'
import { FileTab } from './FileTab'
import { TabProvider } from './TabProvider'
import { AnyFileHandle } from '../FileSystem/Types'
import { hide as hideSidebar } from '../Sidebar/state'
import { reactive } from 'vue'

export interface IOpenTabOptions {
	selectTab?: boolean
	isTemporary?: boolean
	isReadOnly?: boolean
}

export class TabSystem extends MonacoHolder {
	protected uuid = uuid()
	public tabs: Tab[] = reactive([])
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
	get project() {
		return this._project
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

	constructor(protected _project: Project, id = 0) {
		super(_project.app)

		this.openedFiles = new OpenedFiles(
			this,
			_project.app,
			`projects/${_project.name}/.bridge/openedFiles_${id}.json`
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

	async open(
		fileHandle: AnyFileHandle,
		{
			selectTab = true,
			isReadOnly = false,
			isTemporary = true,
		}: IOpenTabOptions = {}
	) {
		const tab = await this.getTabFor(fileHandle, isReadOnly)

		// Default value is true so we only need to update if the caller wants to create a permanent tab
		if (!isTemporary) tab.isTemporary = false

		await this.add(tab, selectTab)
		return tab
	}
	async openPath(path: string, options: IOpenTabOptions = {}) {
		const fileHandle = await this.project.app.fileSystem.getFileHandle(path)

		return await this.open(fileHandle, options)
	}

	protected async getTabFor(fileHandle: AnyFileHandle, isReadOnly = false) {
		let tab: Tab | undefined = undefined
		for (const CurrentTab of this.tabTypes) {
			if (await CurrentTab.is(fileHandle)) {
				// @ts-ignore
				tab = new CurrentTab(this, fileHandle, isReadOnly)
				break
			}
		}
		// Default tab type: Text editor
		if (!tab) tab = new TextTab(this, fileHandle, isReadOnly)

		return await tab.fired
	}
	async hasTab(tab: Tab) {
		for (const currentTab of this.tabs) {
			if (await currentTab.is(tab)) return true
		}

		return false
	}

	async add(tab: Tab, selectTab = true, noTabExistanceCheck = false) {
		this.closeAllTemporary()

		if (!noTabExistanceCheck) {
			for (const currentTab of this.tabs) {
				if (await currentTab.is(tab)) {
					tab.onDeactivate()
					return selectTab ? currentTab.select() : currentTab
				}
			}
		}

		if (!tab.hasFired) await tab.fired

		this.tabs = [...this.tabs, tab]
		if (!tab.isForeignFile && !(tab instanceof FileTab && tab.isReadOnly))
			await this.openedFiles.add(tab.getPath())

		if (selectTab) tab.select()

		this.project.updateTabFolders()

		return tab
	}
	remove(tab: Tab, destroyEditor = true, selectNewTab = true) {
		tab.onDeactivate()
		const tabIndex = this.tabs.findIndex((current) => current === tab)
		if (tabIndex === -1) return

		this.tabs.splice(tabIndex, 1)
		if (destroyEditor) tab.onDestroy()

		if (selectNewTab && tab === this._selectedTab)
			this.select(this.tabs[tabIndex === 0 ? 0 : tabIndex - 1])
		if (!tab.isForeignFile) this.openedFiles.remove(tab.getPath())

		this.project.updateTabFolders()

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
	async closeTabWithHandle(fileHandle: AnyFileHandle) {
		const tab = await this.getTab(fileHandle)
		if (tab) this.close(tab)
	}
	async select(tab?: Tab) {
		if (this.isActive !== !!tab) this.setActive(!!tab)

		if (this.app.mobile.isCurrentDevice()) hideSidebar()
		if (tab?.isSelected) return

		this._selectedTab?.onDeactivate()
		if (tab && tab !== this._selectedTab && this.project.isActiveProject) {
			App.eventSystem.dispatch('currentTabSwitched', tab)
		}
		this._selectedTab = tab

		// Next steps don't need to be done if we simply unselect tab
		if (!tab) return

		await this._selectedTab?.onActivate()

		nextTick(async () => {
			this._monacoEditor?.layout()
		})
	}
	async save(tab = this.selectedTab) {
		if (!tab || (tab instanceof FileTab && tab.isReadOnly)) return

		const app = await App.getApp()
		app.windows.loadingWindow.open()

		// Save whether the tab was selected previously for use later
		const tabWasActive = this.selectedTab === tab

		// We need to select the tab before saving to format it correctly
		const selectedTab = this.selectedTab
		if (selectedTab !== tab) await this.select(tab)

		if (tab instanceof FileTab) await tab.save()

		// Select the previously selected tab again
		if (selectedTab !== tab) await this.select(selectedTab)

		if (!tab.isForeignFile && tab instanceof FileTab) {
			await this.project.updateFile(tab.getPath())

			await this.project.recentFiles.add({
				path: tab.getPath(),
				name: tab.name,
				color: tab.iconColor,
				icon: tab.icon,
			})

			this.project.fileSave.dispatch(tab.getPath(), await tab.getFile())

			// Only refresh auto-completion content if tab is active
			if (tabWasActive)
				App.eventSystem.dispatch('refreshCurrentContext', tab.getPath())
		}

		app.windows.loadingWindow.close()
		tab.focus()
	}
	async saveAs() {
		if (this.selectedTab instanceof FileTab) await this.selectedTab.saveAs()
	}
	async saveAll() {
		const app = await App.getApp()
		app.windows.loadingWindow.open()

		for (const tab of this.tabs) {
			if (tab.isUnsaved) await this.save(tab)
		}

		app.windows.loadingWindow.close()
	}
	closeAllTemporary() {
		for (const tab of [...this.tabs]) {
			if (!tab.isTemporary) continue

			this.remove(tab, true, false)
		}
	}

	async activate() {
		await this.openedFiles.restoreTabs()

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

		if (isActive && this._selectedTab && this.project.isActiveProject) {
			App.eventSystem.dispatch('currentTabSwitched', this._selectedTab)
		}
	}

	async getTab(fileHandle: AnyFileHandle) {
		for (const tab of this.tabs) {
			if (
				tab instanceof FileTab &&
				(await tab.isForFileHandle(fileHandle))
			)
				return tab
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
	get(predicate: (tab: Tab) => boolean) {
		for (const tab of this.tabs) {
			if (predicate(tab)) return tab
		}
	}
}
