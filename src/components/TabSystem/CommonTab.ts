import { v4 as uuid } from 'uuid'
import { TabSystem } from './TabSystem'
import { IFileSystem } from '@/components/FileSystem/Common'
import { App } from '@/App'
import { FileType } from '../Data/FileType'
import { PackType } from '../Data/PackType'
import { showContextMenu } from '../ContextMenu/showContextMenu'

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

	onActivate() {}
	onDeactivate() {}
	onDestroy() {}
	onContextMenu(event: MouseEvent) {
		showContextMenu(event, [
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
					this.parent.closeTabs(tab => {
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
					this.parent.closeTabs(tab => !tab.isUnsaved)
				},
			},
			{
				name: 'actions.closeOtherTabs.name',
				description: 'actions.closeOtherTabs.description',
				icon: 'mdi-unfold-more-vertical',
				onTrigger: () => {
					this.parent.closeTabs(tab => tab !== this)
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
