import { DirectoryWrapper } from '../DirectoryView/DirectoryWrapper'
import { CopyAction } from './Actions/Copy'
import { DeleteAction } from './Actions/Delete'
import { DuplicateAction } from './Actions/Duplicate'
import { PasteAction } from './Actions/Paste'
import { RenameAction } from './Actions/Rename'
import { RevealFilePathAction } from './Actions/RevealFilePath'
import { App } from '/@/App'
import { showContextMenu } from '/@/components/ContextMenu/showContextMenu'
import { InputWindow } from '/@/components/Windows/Common/Input/InputWindow'

interface IFolderOptions {
	hideDelete?: boolean
	hideRename?: boolean
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
					name: 'actionscreateFile.name',
					label: 'general.fileName',
					default: '',
				})
				const name = await inputWindow.fired
				if (!name) return

				const filePath = `${path}/${name}`
				const fileHandle = await app.fileSystem.writeFile(filePath, '')
				app.project.updateFile(filePath)

				// Open file in new tab
				await app.project.openFile(fileHandle, {
					selectTab: true,
				})
				directoryWrapper.refresh()
			},
		},
		{
			icon: 'mdi-folder-plus-outline',
			name: 'actions.createFolder.name',
			description: 'actions.createFolder.description',
			onTrigger: async () => {
				const inputWindow = new InputWindow({
					name: 'actionscreateFolder.name',
					label: 'general.folderName',
					default: '',
				})
				const name = await inputWindow.fired
				if (!name) return

				await app.fileSystem.mkdir(`${path}/${name}`, {
					recursive: true,
				})
				// Refresh pack explorer
				directoryWrapper.refresh()
			},
		},
		{ type: 'divider' },
		CopyAction(directoryWrapper),
		PasteAction(directoryWrapper),
		DuplicateAction(directoryWrapper),
		options.hideRename || directoryWrapper.getParent() === null
			? null
			: RenameAction(directoryWrapper),
		options.hideDelete || directoryWrapper.getParent() === null
			? null
			: DeleteAction(directoryWrapper),
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
