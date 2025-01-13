import { v4 as uuid } from 'uuid'
import { RecoveryState as TabRecoveryState, Tab, RecoveryState } from './Tab'
import { Ref, shallowRef } from 'vue'
import { Editor } from '@/components/Editor/Editor'
import { Event } from '@/libs/event/Event'
import { Disposable } from '@/libs/disposeable/Disposeable'
import { TabTypes } from './TabTypes'
import { FileTab } from './FileTab'

export type TabSystemRecoveryState = { id: string; selectedTab: string | null; tabs: TabRecoveryState[] }

export class TabSystem {
	public id = uuid()
	// Monaco editor freezes browser when made deep reactive, so instead we make it shallow reactive
	public tabs: Ref<Tab[]> = shallowRef([])
	public selectedTab: Ref<Tab | null> = shallowRef(null)

	public savedState = new Event<void>()

	private tabSaveListenters: Record<string, Disposable> = {}

	public async addTab(tab: Tab, select = true) {
		if (this.tabs.value.includes(tab)) {
			if (select) await this.selectTab(tab)

			await this.saveState()

			return
		}

		this.tabSaveListenters[tab.id] = tab.savedState.on(() => {
			this.saveState()
		})

		await tab.create()

		this.tabs.value.push(tab)

		if (select) await this.selectTab(tab)

		await this.saveState()
	}

	public async selectTab(tab: Tab) {
		if (this.selectedTab.value === tab) return

		if (this.selectedTab.value !== null) await this.selectedTab.value.deactivate()

		this.selectedTab.value = tab

		Editor.showTabs()

		await tab.activate()

		await this.saveState()
	}

	public async removeTab(tab: Tab) {
		if (!this.tabs.value.includes(tab)) return

		if (this.selectedTab.value?.id === tab.id) await tab.deactivate()

		this.selectedTab.value = null

		const tabIndex = this.tabs.value.indexOf(tab)

		this.tabs.value.splice(tabIndex, 1)

		if (this.tabs.value.length != 0) await this.selectTab(this.tabs.value[Math.max(tabIndex - 1, 0)])

		await tab.destroy()

		this.tabSaveListenters[tab.id].dispose()
		delete this.tabSaveListenters[tab.id]

		if (this.tabs.value.length === 0) Editor.hideTabs()

		await this.saveState()
	}

	public async clear() {
		for (const tab of this.tabs.value) {
			if (this.selectedTab.value?.id === tab.id) await tab.deactivate()

			await tab.destroy()

			this.tabSaveListenters[tab.id].dispose()
			delete this.tabSaveListenters[tab.id]
		}

		this.tabs.value = []
		this.selectedTab.value = null
	}

	public async saveState() {
		this.savedState.dispatch()
	}

	public async getTabRecoveryState(tab: Tab): Promise<RecoveryState> {
		if (tab instanceof FileTab)
			return {
				id: tab.id,
				path: tab.path,
				state: await tab.getState(),
				type: tab.constructor.name,
			}

		return {
			id: tab.id,
			state: await tab.getState(),
			type: tab.constructor.name,
		}
	}

	public async getRecoveryState(): Promise<TabSystemRecoveryState> {
		return {
			id: this.id,
			selectedTab: this.selectedTab.value ? this.selectedTab.value.id : null,
			tabs: await Promise.all(this.tabs.value.map((tab) => this.getTabRecoveryState(tab))),
		}
	}

	public async applyRecoverState(recoveryState: TabSystemRecoveryState) {
		this.id = recoveryState.id

		this.tabs.value = []

		for (const tabRecoveryState of recoveryState.tabs) {
			const tabType = TabTypes.getType(tabRecoveryState.type)

			if (tabType === null) continue

			if (tabType.prototype instanceof FileTab) {
				const tab = new (tabType as typeof FileTab)(tabRecoveryState.path)

				tab.id = tabRecoveryState.id

				this.tabSaveListenters[tab.id] = tab.savedState.on(() => {
					this.saveState()
				})

				await tab.create()
				await tab.recover(tabRecoveryState.state)

				this.tabs.value.push(tab)
			} else {
				const tab = new (tabType as typeof Tab)()

				tab.id = tabRecoveryState.id

				this.tabSaveListenters[tab.id] = tab.savedState.on(() => {
					this.saveState()
				})

				await tab.create()
				await tab.recover(tabRecoveryState.state)

				this.tabs.value.push(tab)
			}
		}

		this.tabs.value = [...this.tabs.value]

		this.selectedTab.value = this.tabs.value.find((tab) => tab.id === recoveryState.selectedTab) ?? null

		if (this.selectedTab.value === null) return

		await this.selectedTab.value.activate()
	}
}
