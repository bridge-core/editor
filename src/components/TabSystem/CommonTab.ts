import { v4 as uuid } from 'uuid'
import { TabSystem } from './TabSystem'
import { App } from '/@/App'
import { FileType } from '/@/components/Data/FileType'
import { PackType } from '/@/components/Data/PackType'
import { showContextMenu } from '/@/components/ContextMenu/showContextMenu'

export abstract class Tab {
	abstract component: Vue.Component
	uuid = uuid()
	hasRemoteChange = false
	isUnsaved = false

	setIsUnsaved(val: boolean) {
		this.isUnsaved = val
	}

	static is(filePath: string) {
		return false
	}

	constructor(protected parent: TabSystem, protected path: string) {}

	updateParent(parent: TabSystem) {
		this.parent = parent
	}

	get name() {
		const pathArr = this.path.split(/\\|\//g)
		return pathArr.pop()!
	}
	getPath() {
		return this.path
	}
	getPackPath() {
		return this.path.replace(
			`projects/${App.instance.selectedProject}/`,
			''
		)
	}
	get icon() {
		return FileType.get(this.getPackPath())?.icon ?? 'mdi-file-outline'
	}
	get iconColor() {
		return PackType.get(this.getPath())?.color
	}

	get isSelected() {
		return this.parent.selectedTab === this
	}
	select() {
		this.parent.select(this)
		return this
	}
	close() {
		this.parent.close(this)
	}
	isFor(path: string) {
		return path === this.path
	}

	focus() {}
	async onActivate() {}
	onDeactivate() {}
	onDestroy() {}
	protected async toOtherTabSystem(updateParentTabs = true) {
		const app = await App.getApp()
		const tabSystems = app.projectManager.currentProject?.tabSystems!

		const from =
			tabSystems[0] === this.parent ? tabSystems[0] : tabSystems[1]
		const to = tabSystems[0] === this.parent ? tabSystems[1] : tabSystems[0]

		this.updateParent(to)
		if (updateParentTabs) {
			to.add(this, true)
			from.remove(this, false)
		} else {
			await to.openedFiles.add(this.getPath())
			await from.openedFiles.remove(this.getPath())

			to.select(this)
			if (this.isSelected) from.select(from.tabs[0])
		}
	}
	onContextMenu(event: MouseEvent) {
		let moveSplitScreen = []
		// It makes no sense to move a fail to the split-screen if the tab system only has one entry
		if (this.parent.tabs.length > 1) {
			moveSplitScreen.push({
				name: 'actions.moveToSplitScreen.name',
				description: 'actions.moveToSplitScreen.description',
				icon: 'mdi-arrow-split-vertical',
				onTrigger: async () => {
					this.toOtherTabSystem()
				},
			})
		}

		showContextMenu(event, [
			...moveSplitScreen,
			{
				name: 'actions.closeTab.name',
				description: 'actions.closeTab.description',
				icon: 'mdi-close',
				onTrigger: () => {
					this.close()
				},
			},
			{
				name: 'actions.closeAll.name',
				description: 'actions.closeAll.description',
				icon: 'mdi-table-row',
				onTrigger: () => {
					this.parent.closeTabs(() => true)
				},
			},
			{
				name: 'actions.closeTabsToRight.name',
				description: 'actions.closeTabsToRight.description',
				icon: 'mdi-chevron-right',
				onTrigger: () => {
					let closeTabs = true
					this.parent.closeTabs((tab) => {
						if (tab === this) closeTabs = false
						return closeTabs
					})
				},
			},
			{
				name: 'actions.closeAllSaved.name',
				description: 'actions.closeAllSaved.description',
				icon: 'mdi-content-save-outline',
				onTrigger: () => {
					this.parent.closeTabs((tab) => !tab.isUnsaved)
				},
			},
			{
				name: 'actions.closeOtherTabs.name',
				description: 'actions.closeOtherTabs.description',
				icon: 'mdi-unfold-more-vertical',
				onTrigger: () => {
					this.parent.closeTabs((tab) => tab !== this)
				},
			},
		])
	}

	abstract save(): void | Promise<void>

	copy() {
		document.execCommand('copy')
	}
	cut() {
		document.execCommand('cut')
	}
	paste() {}
}
