import { DirectoryWrapper } from '../DirectoryView/DirectoryWrapper'
import { DownloadAction } from './Actions/Download'
import { EditAction } from './Actions/Edit'
import { CopyAction } from './Actions/Edit/Copy'
import { FindInFolderAction } from './Actions/FindInFolder'
import { ImportFileAction } from './Actions/ImportFile'
import { RefreshAction } from './Actions/Refresh'
import { RevealFilePathAction } from './Actions/RevealPath'
import { App } from '/@/App'
import { showContextMenu } from '/@/components/ContextMenu/showContextMenu'
import { InputWindow } from '/@/components/Windows/Common/Input/InputWindow'
import { tryCreateFile } from '/@/utils/file/tryCreateFile'
import { tryCreateFolder } from '/@/utils/file/tryCreateFolder'

interface IFolderOptions {
	hideDelete?: boolean
	hideRename?: boolean
	hideDuplicate?: boolean
}
export async function showFolderContextMenu(
	event: MouseEvent,
	directoryWrapper: DirectoryWrapper,
	options: IFolderOptions = {}
) {
	const app = await App.getApp()
	const path = directoryWrapper.path

	const mutatingActions = (<const>[
		{
			icon: 'mdi-file-plus-outline',
			name: 'actions.createFile.name',

			onTrigger: async () => {
				const inputWindow = new InputWindow({
					name: 'actions.createFile.name',
					label: 'general.fileName',
					default: '',
				})
				const name = await inputWindow.fired
				if (!name) return

				const { type, handle } = await tryCreateFile({
					directoryHandle: directoryWrapper.handle,
					name,
				})

				if (type === 'cancel') return

				if (handle) {
					app.project.updateHandle(handle)
					// Open file in new tab
					await app.project.openFile(handle, {
						selectTab: true,
					})
				}

				directoryWrapper.refresh()
			},
		},
		{
			icon: 'mdi-folder-plus-outline',
			name: 'actions.createFolder.name',

			onTrigger: async () => {
				const inputWindow = new InputWindow({
					name: 'actions.createFolder.name',
					label: 'general.folderName',
					default: '',
				})
				const name = await inputWindow.fired
				if (!name) return

				const { type } = await tryCreateFolder({
					directoryHandle: directoryWrapper.handle,
					name: name,
				})
				if (type === 'cancel') return

				// Refresh pack explorer
				directoryWrapper.refresh()
			},
		},
		ImportFileAction(directoryWrapper),
		FindInFolderAction(directoryWrapper),
		{ type: 'divider' },
		await EditAction(directoryWrapper, options),
	]).filter((action) => action !== null)

	const additionalActions =
		await directoryWrapper.options.provideDirectoryContextMenu?.(
			directoryWrapper
		)

	showContextMenu(event, [
		...(directoryWrapper.options.isReadOnly
			? [
					FindInFolderAction(directoryWrapper),
					CopyAction(directoryWrapper),
			  ]
			: mutatingActions),
		{ type: 'divider' },
		RefreshAction(directoryWrapper),
		DownloadAction(directoryWrapper),
		RevealFilePathAction(directoryWrapper),
		// 	{
		// 		icon: 'mdi-file-search-outline',
		// 		name: 'Find in Folder',
		// 		onTrigger: async () => {},
		// 	},
		...(additionalActions ?? []),
	])
}
