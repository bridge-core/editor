import { Tab } from './CommonTab'
import WelcomeScreen from './WelcomeScreen.vue'
import { TextTab } from '../Editors/Text/TextTab'
import Vue, { computed, Ref, ref } from 'vue'
import { App } from '/@/App'
import { UnsavedFileWindow } from '../Windows/UnsavedFile/UnsavedFile'
import { Project } from '../Projects/Project/Project'
import { OpenedFiles } from './OpenedFiles'
import { v4 as uuid } from 'uuid'
import { MonacoHolder } from './MonacoHolder'
import { FileTab, TReadOnlyMode } from './FileTab'
import { TabProvider } from './TabProvider'
import { AnyFileHandle } from '../FileSystem/Types'
import { IframeTab } from '../Editors/IframeTab/IframeTab'

export interface IOpenTabOptions {
	selectTab?: boolean
	isTemporary?: boolean
	readOnlyMode?: TReadOnlyMode
}

export class TabSystem extends MonacoHolder {
	protected uuid = uuid()
	public tabs = <Ref<Tab[]>>ref([])
	protected _recentSelectedTab = <Ref<Tab | undefined>>ref(undefined)
	protected _selectedTab = <Ref<Tab | undefined>>ref(undefined)
	protected get tabTypes() {
		return TabProvider.tabs
	}
	protected _isActive = ref(true)
	public readonly openedFiles: OpenedFiles

	get isActive() {
		return this._isActive
	}
	public readonly shouldRender = computed(() => this.tabs.value.length > 0)
	public readonly isSharingScreen = computed(() => {
		const other = this.project.tabSystems.find(
			(tabSystem) => tabSystem !== this
		)

		return other?.shouldRender.value ?? false
	})
	get app() {
		return this._app
	}
	get project() {
		return this._project
	}

	get hasUnsavedTabs() {
		return this.tabs.value.some((tab) => tab.isUnsaved)
	}

	constructor(protected _project: Project, id = 0) {
		super(_project.app)

		this.openedFiles = new OpenedFiles(
			this,
			_project.app,
			`${_project.projectPath}/.bridge/openedFiles_${id}.json`
		)
	}

	get recentSelectedTab() {
		return this._recentSelectedTab.value
	}

	get selectedTab() {
		return this._selectedTab.value
	}
	get currentComponent() {
		return this._selectedTab.value?.component ?? WelcomeScreen
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
			readOnlyMode = 'off',
			isTemporary = true,
		}: IOpenTabOptions = {}
	) {
		const tab = await this.getTabFor(fileHandle, readOnlyMode)

		// Default value is true so we only need to update if the caller wants to create a permanent tab
		if (!isTemporary) tab.isTemporary = false

		await this.add(tab, selectTab)
		return tab
	}
	async openPath(path: string, options: IOpenTabOptions = {}) {
		const fileHandle = await this.project.app.fileSystem.getFileHandle(path)

		return await this.open(fileHandle, options)
	}

	protected async getTabFor(
		fileHandle: AnyFileHandle,
		readOnlyMode: TReadOnlyMode = 'off'
	) {
		let tab: Tab | undefined = undefined
		for (const CurrentTab of this.tabTypes) {
			if (await CurrentTab.is(fileHandle)) {
				// @ts-ignore
				tab = new CurrentTab(this, fileHandle, readOnlyMode)
				break
			}
		}
		// Default tab type: Text editor
		if (!tab) tab = new TextTab(this, fileHandle, readOnlyMode)

		return await tab.fired
	}
	async hasTab(tab: Tab) {
		for (const currentTab of this.tabs.value) {
			if (await currentTab.is(tab)) return true
		}

		return false
	}

	async add(tab: Tab, selectTab = true, noTabExistanceCheck = false) {
		await this.closeAllTemporary()

		if (!noTabExistanceCheck) {
			for (const currentTab of this.tabs.value) {
				if (await currentTab.is(tab)) {
					// Trigger openWith event again for iframe tabs
					if (
						tab instanceof IframeTab &&
						currentTab instanceof IframeTab
					) {
						currentTab.setOpenWithPayload(
							tab.getOptions().openWithPayload
						)
					}

					tab.onDeactivate()
					return selectTab ? currentTab.select() : currentTab
				}
			}
		}

		if (!tab.hasFired) await tab.fired

		this.tabs.value = [...this.tabs.value, tab]
		if (!tab.isForeignFile && !(tab instanceof FileTab && tab.isReadOnly))
			await this.openedFiles.add(tab.getPath())

		if (selectTab) tab.select()

		this.project.updateTabFolders()

		return tab
	}
	async remove(tab: Tab, destroyEditor = true, selectNewTab = true) {
		tab.onDeactivate()
		const tabIndex = this.tabs.value.findIndex((current) => current === tab)
		if (tabIndex === -1) return

		this.tabs.value.splice(tabIndex, 1)
		if (destroyEditor) tab.onDestroy()

		if (selectNewTab && tab === this.selectedTab)
			this.select(this.tabs.value[tabIndex === 0 ? 0 : tabIndex - 1])
		if (!tab.isForeignFile) await this.openedFiles.remove(tab.getPath())

		this.project.updateTabFolders()

		return tab
	}
	async close(tab = this.selectedTab, checkUnsaved = true) {
		if (!tab) return false

		if (checkUnsaved && tab.isUnsaved) {
			const unsavedWin = new UnsavedFileWindow(tab)

			return (await unsavedWin.fired) !== 'cancel'
		} else {
			await this.remove(tab)
			return true
		}
	}
	async closeTabWithHandle(fileHandle: AnyFileHandle) {
		const tab = await this.getTab(fileHandle)
		if (tab) this.close(tab)
	}

	/**
	 * Select next tab
	 */
	async selectNextTab() {
		const tabs = this.tabs.value
		if (tabs.length === 0) return

		const selectedTab = this.selectedTab
		if (!selectedTab) return

		const index = tabs.indexOf(selectedTab)
		const nextTab = tabs[index + 1] ?? tabs[0]

		await nextTab.select()
	}
	/**
	 * Select previous tab
	 */
	async selectPreviousTab() {
		const tabs = this.tabs.value
		if (tabs.length === 0) return

		const selectedTab = this.selectedTab
		if (!selectedTab) return

		const index = tabs.indexOf(selectedTab)
		const previousTab = tabs[index - 1] ?? tabs[tabs.length - 1]

		await previousTab.select()
	}

	async hasRecentTab() {
		return this.recentSelectedTab !== undefined
	}

	async selectRecentTab() {
		const tabs = this.tabs.value
		if (tabs.length === 0) return

		const recentTab = this.recentSelectedTab
		if (!recentTab) return

		await recentTab.select()
	}

	async saveRecentTab(tab?: Tab) {
		this._recentSelectedTab.value = tab
	}

	async select(tab?: Tab) {
		if (this.isActive.value !== !!tab) this.setActive(!!tab)

		if (this.app.mobile.isCurrentDevice()) App.sidebar.hide()
		if (tab?.isSelected) return

		this.selectedTab?.onDeactivate()
		if (tab && tab !== this.selectedTab && this.project.isActiveProject) {
			App.eventSystem.dispatch('currentTabSwitched', tab)
		}

		this.saveRecentTab(this.selectedTab)
		this._selectedTab.value = tab

		// Next steps don't need to be done if we simply unselect tab
		if (!tab) return

		await this.selectedTab?.onActivate()

		Vue.nextTick(async () => {
			this._monacoEditor?.layout()
		})
	}
	async save(tab = this.selectedTab) {
		if (!tab || (tab instanceof FileTab && tab.isReadOnly)) return
		tab?.setIsLoading(true)

		// Save whether the tab was selected previously for use later
		const tabWasActive = this.selectedTab === tab

		// We need to select the tab before saving to format it correctly
		const selectedTab = this.selectedTab
		if (selectedTab !== tab) await this.select(tab)

		if (tab instanceof FileTab) await tab.save()

		// Select the previously selected tab again
		if (selectedTab !== tab) await this.select(selectedTab)

		if (!tab.isForeignFile && tab instanceof FileTab) {
			this.project.beforeFileSave.dispatch(
				tab.getPath(),
				await tab.getFile()
			)

			await this.project.updateFile(tab.getPath())

			this.project.fileSave.dispatch(tab.getPath(), await tab.getFile())

			// Only refresh auto-completion content if tab is active
			if (tabWasActive)
				App.eventSystem.dispatch('refreshCurrentContext', tab.getPath())
		}

		tab.focus()
		tab?.setIsLoading(false)
	}
	async saveAs() {
		if (this.selectedTab instanceof FileTab) await this.selectedTab.saveAs()
	}
	async saveAll() {
		const app = await App.getApp()
		app.windows.loadingWindow.open()

		for (const tab of this.tabs.value) {
			if (tab.isUnsaved) await this.save(tab)
		}

		app.windows.loadingWindow.close()
	}
	async closeAllTemporary() {
		for (const tab of [...this.tabs.value]) {
			if (!tab.isTemporary) continue

			await this.remove(tab, true, false)
		}
	}

	async activate() {
		await this.openedFiles.restoreTabs()

		if (this.tabs.value.length > 0) this.setActive(true)

		if (!this.selectedTab && this.tabs.value.length > 0)
			this.tabs.value[0].select()

		await this.selectedTab?.onActivate()
	}
	deactivate() {
		this.selectedTab?.onDeactivate()
		this.dispose()
	}

	setActive(isActive: boolean, updateProject = true) {
		if (updateProject) this.project.setActiveTabSystem(this, !isActive)
		if (isActive === this._isActive.value) return

		this._isActive.value = isActive

		if (isActive && this._selectedTab && this.project.isActiveProject) {
			App.eventSystem.dispatch('currentTabSwitched', this._selectedTab)
		}
	}

	async getTab(fileHandle: AnyFileHandle) {
		for (const tab of this.tabs.value) {
			if (
				tab instanceof FileTab &&
				(await tab.isForFileHandle(fileHandle))
			)
				return tab
		}
	}
	closeTabs(predicate: (tab: Tab) => boolean) {
		const tabs = [...this.tabs.value].reverse()

		for (const tab of tabs) {
			if (predicate(tab)) tab.close()
		}
	}
	forceCloseTabs(predicate: (tab: Tab) => boolean) {
		const tabs = [...this.tabs.value].reverse()

		for (const tab of tabs) {
			if (predicate(tab)) this.remove(tab)
		}
	}
	has(predicate: (tab: Tab) => boolean) {
		for (const tab of this.tabs.value) {
			if (predicate(tab)) return true
		}
		return true
	}
	get(predicate: (tab: Tab) => boolean) {
		for (const tab of this.tabs.value) {
			if (predicate(tab)) return tab
		}
	}
}
