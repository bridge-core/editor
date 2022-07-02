import { markRaw } from '@vue/composition-api'
import { AnyDirectoryHandle } from '../FileSystem/Types'
import { InfoPanel } from '../InfoPanel/InfoPanel'
import { SidebarAction } from '../Sidebar/Content/SidebarAction'
import { SidebarContent } from '../Sidebar/Content/SidebarContent'
import { SidebarElement } from '../Sidebar/create'
import ViewFolderComponent from './ViewFolders.vue'

export class ViewFolders extends SidebarContent {
	component = ViewFolderComponent
	actions: SidebarAction[] = []
	directoryEntries: Record<string, AnyDirectoryHandle> = {}
	topPanel: InfoPanel | undefined = undefined
	protected directoryHandles: {
		handle: AnyDirectoryHandle
		startPath?: string
	}[] = []
	protected sidebarElement: SidebarElement

	constructor() {
		super()

		this.actions.push(
			new SidebarAction({
				icon: 'mdi-close',
				name: 'Close',
				color: 'error',
				onTrigger: () => {
					this.directoryHandles = []
					this.sidebarElement.click()
				},
			})
		)

		this.sidebarElement = markRaw(
			new SidebarElement({
				id: 'viewOpenedFolders',
				sidebarContent: this,
				displayName: 'Opened Folders',
				icon: 'mdi-folder-open-outline',
				isVisible: () => this.directoryHandles.length > 0,
			})
		)
	}

	addDirectoryHandle(
		directoryHandle: AnyDirectoryHandle,
		startPath?: string
	) {
		this.directoryHandles.push({ handle: directoryHandle, startPath })

		if (!this.sidebarElement.isSelected) this.sidebarElement.click()
	}
}
