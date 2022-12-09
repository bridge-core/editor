import { SimpleAction } from '../Actions/SimpleAction'
import { AnyDirectoryHandle } from '../FileSystem/Types'
import { InformedChoiceWindow } from '../Windows/InformedChoice/InformedChoice'
import { App } from '/@/App'

export interface IFolderHandler {
	icon: string
	name: string
	description: string
	onSelect: (directoryHandle: AnyDirectoryHandle) => Promise<void> | void
}
export class FolderImportManager {
	protected readonly folderHandler = new Set<IFolderHandler>()

	constructor() {
		/**
		 * Setting the output folder isn't possible on Tauri builds
		 * We don't want a browser directory handle, we want our custom virtual directory handle
		 */
		if (!import.meta.env.VITE_IS_TAURI_APP) {
			this.addImporter({
				icon: 'mdi-minecraft',
				name: 'fileDropper.importMethod.folder.output.name',
				description:
					'fileDropper.importMethod.folder.output.description',
				onSelect: async (directoryHandle) => {
					const app = await App.getApp()

					await app.comMojang.handleComMojangDrop(directoryHandle)
				},
			})
		}

		this.addImporter({
			icon: 'mdi-folder-open-outline',
			name: 'fileDropper.importMethod.folder.open.name',
			description: 'fileDropper.importMethod.folder.open.description',
			onSelect: async (directoryHandle) => {
				const app = await App.getApp()

				try {
					await directoryHandle.requestPermission({
						mode: 'readwrite',
					})
				} catch {
					return
				}

				app.viewFolders.addDirectoryHandle({ directoryHandle })
			},
		})
	}

	addImporter(handler: IFolderHandler) {
		this.folderHandler.add(handler)

		return {
			dispose: () => {
				this.folderHandler.delete(handler)
			},
		}
	}

	async onImportFolder(directoryHandle: AnyDirectoryHandle) {
		/**
		 * If there is only one handler, use it without prompting the user for a choice
		 */
		if (this.folderHandler.size === 1) {
			const handler = [...this.folderHandler][0]
			await handler.onSelect(directoryHandle)

			return
		}

		const informedChoiceWindow = new InformedChoiceWindow(
			'fileDropper.importMethod.name',
			{
				isPersistent: false,
			}
		)
		const actionManager = await informedChoiceWindow.actionManager

		this.folderHandler.forEach(({ onSelect, ...config }) =>
			actionManager.create({
				...config,
				onTrigger: () => onSelect(directoryHandle),
			})
		)

		informedChoiceWindow.open()
		await informedChoiceWindow.fired
	}
}
