import { markRaw } from 'vue'
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

			this.updateVisibility()
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

	async updateVisibility() {
		if (this.directoryHandles.length > 0) return

		const app = await App.getApp()
		// Unselect ViewFolders tab by selecting packExplorer/viewComMojangProject instead
		if (app.viewComMojangProject.hasComMojangProjectLoaded)
			App.sidebar.elements.viewComMojangProject.select()
		else App.sidebar.elements.packExplorer.select()
	}

	async addDirectoryHandle({
		directoryHandle,
		...other
	}: IViewHandleOptions) {
		if (await this.hasDirectoryHandle(directoryHandle)) return

		this.directoryHandles.push({
			directoryHandle,
			...other,
			provideDirectoryContextMenu: (directoryWrapper) => {
				return [
					directoryWrapper.getParent() === null
						? {
								name: 'sidebar.openedFolders.removeFolder',
								icon: 'mdi-eye-off-outline',
								onTrigger: async () => {
									await this.removeDirectoryHandle(
										directoryWrapper.handle
									)
									await this.updateVisibility()
								},
						  }
						: null,
				]
			},
		})

		if (!this.sidebarElement.isSelected) this.sidebarElement.select()
	}
	async removeDirectoryHandle(directoryHandle: AnyDirectoryHandle) {
		for (let i = 0; i < this.directoryHandles.length; i++) {
			const curr = this.directoryHandles[i]
			if (await curr.directoryHandle.isSameEntry(<any>directoryHandle)) {
				this.directoryHandles.splice(i, 1)
				return
			}
		}

		throw new Error('directoryHandle to remove not found')
	}
	async hasDirectoryHandle(directoryHandle: AnyDirectoryHandle) {
		for (const { directoryHandle: currHandle } of this.directoryHandles) {
			if (await currHandle.isSameEntry(<any>directoryHandle)) return true
		}

		return false
	}
}
