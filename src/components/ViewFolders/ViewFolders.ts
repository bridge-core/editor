import { markRaw } from '@vue/composition-api'
import { AnyDirectoryHandle } from '../FileSystem/Types'
import { InfoPanel } from '../InfoPanel/InfoPanel'
import { IComMojangProject } from '../OutputFolders/ComMojang/ProjectLoader'
import { SelectableSidebarAction } from '../Sidebar/Content/SelectableSidebarAction'
import { SidebarAction } from '../Sidebar/Content/SidebarAction'
import { SidebarContent } from '../Sidebar/Content/SidebarContent'
import { SidebarElement } from '../Sidebar/SidebarElement'
import { IDirectoryViewerOptions } from '../UIElements/DirectoryViewer/DirectoryStore'
import ViewFolderComponent from './ViewFolders.vue'
import { App } from '/@/App'

export interface IViewHandleOptions extends IDirectoryViewerOptions {
	directoryHandle: AnyDirectoryHandle
}
export class ViewFolders extends SidebarContent {
	component = ViewFolderComponent
	actions: SidebarAction[] = []
	topPanel: InfoPanel | undefined = undefined

	protected directoryHandles: IViewHandleOptions[] = []
	protected sidebarElement: SidebarElement
	protected closeAction = new SidebarAction({
		icon: 'mdi-close',
		name: 'general.close',
		color: 'error',
		onTrigger: async () => {
			this.directoryHandles = []

			const app = await App.getApp()
			// Unselect ViewFolders tab by selecting packExplorer/viewComMojangProject instead
			if (app.viewComMojangProject.hasComMojangProjectLoaded)
				App.sidebar.elements.viewComMojangProject.select()
			else App.sidebar.elements.packExplorer.select()
		},
	})

	constructor() {
		super()

		this.actions = [this.closeAction]

		this.sidebarElement = markRaw(
			new SidebarElement({
				id: 'viewOpenedFolders',
				group: 'packExplorer',
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
		for (const { directoryHandle: currHandle } of this.directoryHandles) {
			if (await currHandle.isSameEntry(<any>directoryHandle)) return true
		}

		return false
	}
}
