import { markRaw } from 'vue'
import { addFilesToCommandBar } from '../CommandBar/AddFiles'
import { AnyDirectoryHandle } from '../FileSystem/Types'
import { InfoPanel } from '../InfoPanel/InfoPanel'
import { SidebarAction } from '../Sidebar/Content/SidebarAction'
import { SidebarContent } from '../Sidebar/Content/SidebarContent'
import { SidebarElement } from '../Sidebar/SidebarElement'
import { IDirectoryViewerOptions } from '../UIElements/DirectoryViewer/DirectoryStore'
import ViewFolderComponent from './ViewFolders.vue'
import { App } from '/@/App'
import { IDisposable } from '/@/types/disposable'
import { isSameEntry } from '/@/utils/file/isSameEntry'

export interface IViewHandleOptions extends IDirectoryViewerOptions {
	directoryHandle: AnyDirectoryHandle
	isDisposed?: boolean
	disposable?: IDisposable | null
	onDispose?: () => void
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
			this.directoryHandles.forEach((handle) => handle.onDispose?.())
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

		const viewHandle: IViewHandleOptions = {
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
			isDisposed: false,
			disposable: null,
			onDispose() {
				// When folder gets removed from ViewFolders, remove its actions from CommandBar
				this.disposable?.dispose()
				this.isDisposed = true
			},
		}

		// Add files from this folder to CommandBar
		addFilesToCommandBar(viewHandle.directoryHandle).then((disposable) => {
			// Folder was already removed, so immediately dispose actions added to CommandBar again
			if (viewHandle.isDisposed) disposable.dispose()
			// Else, store disposable to remove actions later
			else viewHandle.disposable = disposable
		})
		this.directoryHandles.push(viewHandle)

		if (!this.sidebarElement.isSelected) this.sidebarElement.select()
	}
	async removeDirectoryHandle(directoryHandle: AnyDirectoryHandle) {
		for (let i = 0; i < this.directoryHandles.length; i++) {
			const curr = this.directoryHandles[i]
			if (await curr.directoryHandle.isSameEntry(<any>directoryHandle)) {
				this.directoryHandles.splice(i, 1)
				curr.onDispose?.()
				return
			}
		}

		throw new Error('directoryHandle to remove not found')
	}
	async hasDirectoryHandle(directoryHandle: AnyDirectoryHandle) {
		for (const { directoryHandle: currHandle } of this.directoryHandles) {
			if (await isSameEntry(currHandle, directoryHandle)) return true
		}

		return false
	}
}
