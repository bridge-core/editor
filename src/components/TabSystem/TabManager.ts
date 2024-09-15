import { ShallowRef, shallowRef } from 'vue'
import { Tab } from './Tab'
import { TabSystem } from './TabSystem'
import { TextTab } from '@/components/Tabs/Text/TextTab'
import { TreeEditorTab } from '@/components/Tabs/TreeEditor/TreeEditorTab'
import { ImageTab } from '@/components/Tabs/Image/ImageTab'
import { FileTab } from './FileTab'
import { Settings } from '@/libs/settings/Settings'

export class TabManager {
	public static tabSystems: TabSystem[] = [new TabSystem()]
	public static focusedTabSystem: ShallowRef<TabSystem | null> = shallowRef(null)

	private static tabTypes: (typeof FileTab)[] = [ImageTab, TextTab, TreeEditorTab]

	public static setup() {
		Settings.addSetting('jsonEditor', {
			default: 'text',
		})

		Settings.updated.on((event) => {
			const { id, value } = event as { id: string; value: any }

			if (id !== 'jsonEditor') return

			if (value === 'text') {
				this.tabTypes = [ImageTab, TextTab, TreeEditorTab]
			} else {
				this.tabTypes = [ImageTab, TreeEditorTab, TextTab]
			}
		})
	}

	public static async openTab(tab: Tab) {
		for (const tabSystem of TabManager.tabSystems) {
			for (const otherTab of tabSystem.tabs.value) {
				if (otherTab === tab) {
					await tabSystem.selectTab(tab)

					TabManager.focusedTabSystem.value = tabSystem

					return
				}
			}
		}

		await TabManager.getDefaultTabSystem().addTab(tab)

		TabManager.focusedTabSystem.value = TabManager.getDefaultTabSystem()
	}

	public static async openFile(path: string) {
		for (const tabSystem of TabManager.tabSystems) {
			for (const tab of tabSystem.tabs.value) {
				if (tab instanceof FileTab && tab.is(path)) {
					await tabSystem.selectTab(tab)

					TabManager.focusedTabSystem.value = tabSystem

					return
				}
			}
		}

		for (const TabType of TabManager.tabTypes) {
			if (TabType.canEdit(path)) {
				await TabManager.openTab(new TabType(path))

				return
			}
		}
	}

	public static getTabByType<T extends Tab>(tabType: { new (...args: any[]): T }): T | null {
		for (const tabSystem of TabManager.tabSystems) {
			for (const tab of tabSystem.tabs.value) {
				if (tab instanceof tabType) {
					return tab
				}
			}
		}

		return null
	}

	public static getDefaultTabSystem(): TabSystem {
		return TabManager.tabSystems[0]
	}

	public static getFocusedTab(): Tab | null {
		if (TabManager.focusedTabSystem.value === null) return null

		return TabManager.focusedTabSystem.value.selectedTab.value
	}
}
