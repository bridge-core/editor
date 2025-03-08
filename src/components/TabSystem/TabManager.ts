import { ShallowRef, shallowRef } from 'vue'
import { Tab } from './Tab'
import { TabSystem, TabSystemRecoveryState } from './TabSystem'
import { FileTab } from './FileTab'
import { Settings } from '@/libs/settings/Settings'
import { TabTypes } from './TabTypes'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { Disposable } from '@/libs/disposeable/Disposeable'
import { Event } from '@/libs/event/Event'

type TabManagerRecoveryState = { tabSystems: TabSystemRecoveryState[]; focusedTabSystem: string }

export class TabManager {
	public static tabSystems: ShallowRef<TabSystem[]> = shallowRef([])
	public static focusedTabSystem: ShallowRef<TabSystem | null> = shallowRef(null)

	public static focusedTabSystemChanged: Event<void> = new Event()

	private static tabSystemSaveListenters: Record<string, Disposable> = {}

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

		TabManager.tabSystemSaveListenters[tabSystem.id] = tabSystem.savedState.on(() => {
			TabManager.save()
		})

		TabManager.tabSystems.value.push(tabSystem)

		return tabSystem
	}

	public static async removeTabSystem(tabSystem: TabSystem) {
		if (!TabManager.tabSystems.value.includes(tabSystem)) return

		if (TabManager.focusedTabSystem.value?.id === tabSystem.id) {
			TabManager.focusedTabSystem.value = null
			this.focusedTabSystemChanged.dispatch()
		}

		TabManager.tabSystems.value.splice(TabManager.tabSystems.value.indexOf(tabSystem), 1)

		TabManager.tabSystemSaveListenters[tabSystem.id].dispose()
		delete TabManager.tabSystemSaveListenters[tabSystem.id]

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

		await TabManager.addTabSystem()

		await TabManager.recover()
	}

	public static async openTab(tab: Tab) {
		for (const tabSystem of TabManager.tabSystems.value) {
			for (const otherTab of tabSystem.tabs.value) {
				if (otherTab === tab) {
					await tabSystem.selectTab(tab)

					TabManager.focusedTabSystem.value = tabSystem
					this.focusedTabSystemChanged.dispatch()

					return
				}
			}
		}

		await TabManager.getDefaultTabSystem().addTab(tab)

		TabManager.focusedTabSystem.value = TabManager.getDefaultTabSystem()
		this.focusedTabSystemChanged.dispatch()
	}

	public static async openFile(path: string) {
		for (const tabSystem of TabManager.tabSystems.value) {
			for (const tab of tabSystem.tabs.value) {
				if (tab instanceof FileTab && tab.is(path)) {
					await tabSystem.selectTab(tab)

					TabManager.focusedTabSystem.value = tabSystem
					this.focusedTabSystemChanged.dispatch()

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

		TabManager.focusedTabSystem.value = TabManager.tabSystems.value.find((tabSystem) => tabSystem.id === state.focusedTabSystem) ?? null
		this.focusedTabSystemChanged.dispatch()
	}
}
