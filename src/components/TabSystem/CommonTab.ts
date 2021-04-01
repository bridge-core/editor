import { v4 as uuid } from 'uuid'
import { TabSystem } from './TabSystem'
import { App } from '/@/App'
import { FileType } from '/@/components/Data/FileType'
import { PackType } from '/@/components/Data/PackType'
import { showContextMenu } from '/@/components/ContextMenu/showContextMenu'
import { Signal } from '/@/components/Common/Event/Signal'
import { SimpleAction } from '../Actions/SimpleAction'

export abstract class Tab extends Signal<Tab> {
	abstract component: Vue.Component
	uuid = uuid()
	hasRemoteChange = false
	isUnsaved = false
	protected projectPath?: string
	isForeignFile = false
	protected actions: SimpleAction[] = []

	setIsUnsaved(val: boolean) {
		this.isUnsaved = val
	}

	static is(fileHandle: FileSystemFileHandle) {
		return false
	}

	constructor(
		protected parent: TabSystem,
		protected fileHandle: FileSystemFileHandle
	) {
		super()
		this.setup()
	}

	async setup() {
		this.projectPath = await this.parent.projectRoot
			.resolve(this.fileHandle)
			.then((path) => path?.join('/'))

		// If the resolve above failed, we are dealing with a file which doesn't belong to this project
		if (!this.projectPath) {
			this.isForeignFile = true
			this.projectPath = `${uuid()}/${this.fileHandle.name}`
		}

		this.dispatch(this)
	}

	updateParent(parent: TabSystem) {
		this.parent = parent
	}

	get name() {
		return this.fileHandle.name
	}
	/**
	 * @returns Undefined if the file that belongs to this tab is not inside of a bridge. project
	 */
	getPath() {
		if (!this.projectPath)
			throw new Error(
				`Trying to access projectPath before tab finished loading`
			)
		return `projects/${this.parent.projectName}/${this.projectPath}`
	}
	/**
	 * @returns Undefined if the file that belongs to this tab is not inside of the current project
	 */
	getProjectPath() {
		if (!this.projectPath)
			throw new Error(
				`Trying to access projectPath before tab finished loading`
			)
		return this.projectPath
	}
	get icon() {
		return FileType.get(this.getProjectPath())?.icon ?? 'mdi-file-outline'
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
	async isFor(fileHandle: FileSystemFileHandle) {
		return await fileHandle.isSameEntry(this.fileHandle)
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

	addAction(...actions: SimpleAction[]) {
		this.actions.push(...actions)
	}

	onContextMenu(event: MouseEvent) {
		let moveSplitScreen = []
		// It makes no sense to move a file to the split-screen if the tab system only has one entry
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
