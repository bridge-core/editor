import { DirectoryWrapper } from '../DirectoryView/DirectoryWrapper'
import { EditAction } from './Actions/Edit'
import { CopyAction } from './Actions/Edit/Copy'
import { RevealFilePathAction } from './Actions/RevealFilePath'
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
			description: 'actions.createFile.description',
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
			description: 'actions.createFolder.description',
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
		{ type: 'divider' },
		await EditAction(directoryWrapper, options),
	]).filter((action) => action !== null)

	showContextMenu(event, [
		...(directoryWrapper.options.isReadOnly
			? [CopyAction(directoryWrapper)]
			: mutatingActions),
		{ type: 'divider' },

		RevealFilePathAction(directoryWrapper),
		// 	{
		// 		icon: 'mdi-file-search-outline',
		// 		name: 'Find in Folder',
		// 		onTrigger: async () => {},
		// 	},
		...(directoryWrapper.options.provideDirectoryContextMenu?.(
			directoryWrapper
		) ?? []),
	])
}
