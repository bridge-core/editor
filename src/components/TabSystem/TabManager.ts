import { ShallowRef, shallowRef } from 'vue'
import { Tab } from './Tab'
import { TabSystem, TabSystemRecoveryState } from './TabSystem'
import { FileTab } from './FileTab'
import { Settings } from '@/libs/settings/Settings'
import { TabTypes } from './TabTypes'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { Disposable, disposeAll } from '@/libs/disposeable/Disposeable'
import { Event } from '@/libs/event/Event'

type TabManagerRecoveryState = { tabSystems: TabSystemRecoveryState[]; focusedTabSystem: string }

export class TabManager {
	public static tabSystems: ShallowRef<TabSystem[]> = shallowRef([])
	public static focusedTabSystem: ShallowRef<TabSystem | null> = shallowRef(null)

	public static focusedTabSystemChanged: Event<void> = new Event()

	private static tabDisposables: Record<string, Disposable[]> = {}

	public static setup() {
		Settings.addSetting('compactTabDesign', {
			default: true,
		})

		ProjectManager.updatedCurrentProject.on(() => {
			if (ProjectManager.currentProject === null) {
				TabManager.clear()
			} else {
				TabManager.loadedProject()
			}
		})
	}

	public static async addTabSystem(recoveryState?: TabSystemRecoveryState): Promise<TabSystem> {
		const tabSystem = new TabSystem()

		if (recoveryState) await tabSystem.applyRecoverState(recoveryState)

		TabManager.tabDisposables[tabSystem.id] = [
			tabSystem.savedState.on(() => {
				TabManager.save()
			}),
			tabSystem.removedTab.on(() => {
				if (tabSystem.tabs.value.length > 0) return

				this.removeTabSystem(tabSystem)
			}),
			tabSystem.focused.on(() => {
				this.focusTabSystem(tabSystem)
			}),
		]

		TabManager.tabSystems.value.push(tabSystem)
		TabManager.tabSystems.value = [...TabManager.tabSystems.value]

		return tabSystem
	}

	public static async removeTabSystem(tabSystem: TabSystem) {
		if (!TabManager.tabSystems.value.includes(tabSystem)) return

		if (TabManager.focusedTabSystem.value?.id === tabSystem.id) {
			TabManager.focusedTabSystem.value = null
			this.focusedTabSystemChanged.dispatch()
		}

		TabManager.tabSystems.value.splice(TabManager.tabSystems.value.indexOf(tabSystem), 1)
		TabManager.tabSystems.value = [...TabManager.tabSystems.value]

		disposeAll(TabManager.tabDisposables[tabSystem.id])
		delete TabManager.tabDisposables[tabSystem.id]

		await tabSystem.clear()
	}

	public static async clear() {
		const tabSystems = TabManager.tabSystems.value

		for (const tabSystem of tabSystems) {
			await TabManager.removeTabSystem(tabSystem)
		}
	}

	public static async loadedProject() {
		if (!ProjectManager.currentProject) return

		await TabManager.clear()

		await TabManager.recover()
	}

	public static async openTab(tab: Tab) {
		for (const tabSystem of TabManager.tabSystems.value) {
			for (const otherTab of tabSystem.tabs.value) {
				if (otherTab === tab) {
					await tabSystem.selectTab(tab)

					this.focusTabSystem(tabSystem)

					return
				}
			}
		}

		if (TabManager.tabSystems.value.length === 0) TabManager.addTabSystem()

		const tabSystem = TabManager.getFocusedTabSystem() ?? TabManager.getDefaultTabSystem()

		await tabSystem.addTab(tab)

		this.focusTabSystem(tabSystem)
	}

	public static async openFile(path: string) {
		for (const tabSystem of TabManager.tabSystems.value) {
			for (const tab of tabSystem.tabs.value) {
				if (tab instanceof FileTab && tab.is(path)) {
					await tabSystem.selectTab(tab)

					this.focusTabSystem(tabSystem)

					return
				}
			}
		}

		for (const TabType of TabTypes.fileTabTypes.toSorted((a, b) => b.editPriority(path) - a.editPriority(path))) {
			if (TabType.canEdit(path)) {
				await TabManager.openTab(new TabType(path))

				return
			}
		}
	}

	public static getTabByType<T extends Tab>(tabType: { new (...args: any[]): T }): T | null {
		for (const tabSystem of TabManager.tabSystems.value) {
			for (const tab of tabSystem.tabs.value) {
				if (tab instanceof tabType) {
					return tab
				}
			}
		}

		return null
	}

	public static getDefaultTabSystem(): TabSystem {
		return TabManager.tabSystems.value[0]
	}

	public static getFocusedTab(): Tab | null {
		if (TabManager.focusedTabSystem.value === null) return null

		return TabManager.focusedTabSystem.value.selectedTab.value
	}

	public static getFocusedTabSystem(): TabSystem | null {
		return TabManager.focusedTabSystem.value
	}

	public static focusTabSystem(tabSystem: TabSystem | null) {
		TabManager.focusedTabSystem.value = tabSystem
		this.focusedTabSystemChanged.dispatch()
	}

	public static isTabOpen(tab: Tab): boolean {
		for (const tabSystem of TabManager.tabSystems.value) {
			for (const otherTab of tabSystem.tabs.value) {
				if (otherTab === tab) return true
			}
		}

		return false
	}

	public static isFileOpen(path: string): boolean {
		for (const tabSystem of TabManager.tabSystems.value) {
			for (const tab of tabSystem.tabs.value) {
				if (tab instanceof FileTab && tab.is(path)) return true
			}
		}

		return false
	}

	public static async save() {
		if (!ProjectManager.currentProject) return

		const state = {
			tabSystems: await Promise.all(TabManager.tabSystems.value.map((tabSystem) => tabSystem.getRecoveryState())),
			focusedTabSystem: TabManager.focusedTabSystem.value ? TabManager.focusedTabSystem.value.id : null,
		}

		await ProjectManager.currentProject.saveTabManagerState(state)
	}

	public static async recover() {
		if (!ProjectManager.currentProject) return

		const state = (await ProjectManager.currentProject.getTabManagerState()) as TabManagerRecoveryState | null

		if (state === null) return

		await TabManager.clear()

		for (const tabSystemState of state.tabSystems) {
			await TabManager.addTabSystem(tabSystemState)
		}

		TabManager.tabSystems.value = [...TabManager.tabSystems.value]

		this.focusTabSystem(TabManager.tabSystems.value.find((tabSystem) => tabSystem.id === state.focusedTabSystem) ?? null)
	}
}
