import { v4 as uuid } from 'uuid'
import { RecoveryState as TabRecoveryState, Tab, RecoveryState } from './Tab'
import { Ref, ShallowRef, shallowRef, watchEffect } from 'vue'
import { Editor } from '@/components/Editor/Editor'
import { Event } from '@/libs/event/Event'
import { Disposable } from '@/libs/disposeable/Disposeable'
import { TabTypes } from './TabTypes'
import { FileTab } from './FileTab'
import { Settings } from '@/libs/settings/Settings'

export type TabSystemRecoveryState = { id: string; selectedTab: string | null; tabs: TabRecoveryState[] }

export class TabSystem {
	public id = uuid()
	// Monaco editor freezes browser when made deep reactive, so instead we make it shallow reactive
	public tabs: ShallowRef<Tab[]> = shallowRef([])
	public selectedTab: ShallowRef<Tab | null> = shallowRef(null)

	public savedState = new Event<void>()
	public removedTab = new Event<void>()
	public focused = new Event<void>()

	private tabSaveListenters: Record<string, Disposable> = {}

	public async addTab(tab: Tab, select = true, temporary = false) {
		if (this.hasTab(tab)) {
			if (select) await this.selectTab(tab)

			await this.saveState()

			return
		}

		tab.temporary.value = temporary

		this.tabSaveListenters[tab.id] = tab.savedState.on(() => {
			this.saveState()
		})

		await tab.create()

		this.tabs.value.push(tab)
		this.tabs.value = [...this.tabs.value]

		if (select) await this.selectTab(tab)

		await this.saveState()

		if (temporary) {
			const otherTemporaryTabs = this.tabs.value.filter((otherTab) => otherTab.temporary.value && otherTab.id !== tab.id)

			for (const otherTab of otherTemporaryTabs) {
				if (Settings.get('keepTabsOpen')) {
					otherTab.temporary.value = false
				} else {
					if (otherTab.temporary.value) await this.removeTab(otherTab)
				}
			}
		}
	}

	public async selectTab(tab: Tab) {
		if (this.selectedTab.value?.id === tab.id) return

		if (this.selectedTab.value !== null) {
			this.selectedTab.value.active = false
			await this.selectedTab.value.deactivate()
		}

		this.selectedTab.value = tab

		Editor.showTabs()

		tab.active = true
		await tab.activate()

		await this.saveState()
	}

	public async removeTab(tab: Tab) {
		if (!this.hasTab(tab)) return

		const selectedTab = this.selectedTab.value?.id === tab.id

		if (selectedTab) {
			tab.active = false
			await tab.deactivate()
		}

		const tabIndex = this.tabs.value.indexOf(tab)

		this.tabs.value.splice(tabIndex, 1)
		this.tabs.value = [...this.tabs.value]

		if (selectedTab) {
			this.selectedTab.value = null

			if (this.tabs.value.length != 0) await this.selectTab(this.tabs.value[Math.max(tabIndex - 1, 0)])
		}

		await tab.destroy()

		this.tabSaveListenters[tab.id].dispose()
		delete this.tabSaveListenters[tab.id]

		if (this.tabs.value.length === 0) Editor.hideTabs()

		await this.saveState()

		this.removedTab.dispatch()
	}

	public async clear() {
		for (const tab of this.tabs.value) {
			if (this.selectedTab.value?.id === tab.id) {
				tab.active = false
				await tab.deactivate()
			}

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
				state: (await tab.getState()) ?? null,
				temporary: tab.temporary.value,
				type: tab.constructor.name,
			}

		return {
			id: tab.id,
			state: (await tab.getState()) ?? null,
			temporary: tab.temporary.value,
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
				tab.temporary.value = tabRecoveryState.temporary

				this.tabSaveListenters[tab.id] = tab.savedState.on(() => {
					this.saveState()
				})

				await tab.create()
				await tab.recover(tabRecoveryState.state)

				this.tabs.value.push(tab)
			} else {
				const tab = new (tabType as typeof Tab)()

				tab.id = tabRecoveryState.id
				tab.temporary.value = tabRecoveryState.temporary

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

		this.selectedTab.value.active = true
		await this.selectedTab.value.activate()
	}

	public focus() {
		this.focused.dispatch()
	}

	public async nextTab() {
		const tab = this.selectedTab.value

		if (!tab) return

		const index = this.tabs.value.indexOf(tab)

		if (index === -1) return

		const nextIndex = index < this.tabs.value.length - 1 ? index + 1 : 0

		await this.selectTab(this.tabs.value[nextIndex])
	}

	public async previousTab() {
		const tab = this.selectedTab.value

		if (!tab) return

		const index = this.tabs.value.indexOf(tab)

		if (index === -1) return

		const previousIndex = index > 0 ? index - 1 : this.tabs.value.length - 1

		await this.selectTab(this.tabs.value[previousIndex])
	}

	public hasTab(tab: Tab): boolean {
		return this.tabs.value.some((otherTab) => otherTab.id === tab.id)
	}
}
