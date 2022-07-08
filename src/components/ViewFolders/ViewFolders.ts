import { markRaw } from '@vue/composition-api'
import { AnyDirectoryHandle } from '../FileSystem/Types'
import { InfoPanel } from '../InfoPanel/InfoPanel'
import { SidebarAction } from '../Sidebar/Content/SidebarAction'
import { SidebarContent } from '../Sidebar/Content/SidebarContent'
import { SidebarElement } from '../Sidebar/SidebarElement'
import ViewFolderComponent from './ViewFolders.vue'
import { App } from '/@/App'

export interface IViewHandleOptions {
	directoryHandle: AnyDirectoryHandle
	startPath?: string
	defaultIconColor?: string
}
export class ViewFolders extends SidebarContent {
	component = ViewFolderComponent
	actions: SidebarAction[] = []
	directoryEntries: Record<string, AnyDirectoryHandle> = {}
	topPanel: InfoPanel | undefined = undefined
	protected directoryHandles: IViewHandleOptions[] = []
	protected sidebarElement: SidebarElement

	constructor() {
		super()

		this.actions.push(
			new SidebarAction({
				icon: 'mdi-close',
				name: 'general.close',
				color: 'error',
				onTrigger: () => {
					this.directoryHandles = []
					// Unselect ViewFolders tab by selecting packExplorer instead
					App.sidebar.elements.packExplorer.click()
				},
			})
		)

		this.sidebarElement = markRaw(
			new SidebarElement({
				id: 'viewOpenedFolders',
				sidebarContent: this,
				displayName: 'sidebar.openedFolders.name',
				icon: 'mdi-folder-open-outline',
				isVisible: () => this.directoryHandles.length > 0,
			})
		)
	}

	async addDirectoryHandle({
		directoryHandle,
		...other
	}: IViewHandleOptions) {
		if (await this.hasDirectoryHandle(directoryHandle)) return

		this.directoryHandles.push({ directoryHandle, ...other })

		if (!this.sidebarElement.isSelected) this.sidebarElement.select()
	}
	async hasDirectoryHandle(directoryHandle: AnyDirectoryHandle) {
		for (const { directoryHandle } of this.directoryHandles) {
			if (await directoryHandle.isSameEntry(<any>directoryHandle))
				return true
		}

		return false
	}
}
