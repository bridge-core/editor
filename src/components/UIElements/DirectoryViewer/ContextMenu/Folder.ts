import { DirectoryWrapper } from '../DirectoryView/DirectoryWrapper'
import { EditAction } from './Actions/Edit'
import { CopyAction } from './Actions/Edit/Copy'
import { RevealFilePathAction } from './Actions/RevealFilePath'
import { App } from '/@/App'
import { showContextMenu } from '/@/components/ContextMenu/showContextMenu'
import { InputWindow } from '/@/components/Windows/Common/Input/InputWindow'

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
					name: 'actions.createFolder.name',
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
