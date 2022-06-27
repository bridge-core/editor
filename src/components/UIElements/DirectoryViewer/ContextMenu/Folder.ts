import { DirectoryWrapper } from '../DirectoryView/DirectoryWrapper'
import { DeleteAction } from './Actions/Delete'
import { RevealFilePathAction } from './Actions/RevealFilePath'
import { App } from '/@/App'
import { showContextMenu } from '/@/components/ContextMenu/showContextMenu'
import { InputWindow } from '/@/components/Windows/Common/Input/InputWindow'

export async function showFolderContextMenu(
	event: MouseEvent,
	directoryWrapper: DirectoryWrapper
) {
	const app = await App.getApp()
	const path = directoryWrapper.path

	const mutatingActions = <const>[
		{
			icon: 'mdi-file-plus-outline',
			name: 'windows.packExplorer.fileActions.createFile.name',
			description:
				'windows.packExplorer.fileActions.createFile.description',
			onTrigger: async () => {
				const inputWindow = new InputWindow({
					name: 'windows.packExplorer.fileActions.createFile.name',
					label: 'general.fileName',
					default: '',
				})
				const name = await inputWindow.fired
				if (!name) return

				const fileHandle = await app.fileSystem.writeFile(
					`${path}/${name}`,
					''
				)

				App.eventSystem.dispatch('fileAdded', undefined)

				// Open file in new tab
				await app.project.openFile(fileHandle, {
					selectTab: true,
				})
				directoryWrapper.refresh()
			},
		},
		{
			icon: 'mdi-folder-plus-outline',
			name: 'windows.packExplorer.fileActions.createFolder.name',
			description:
				'windows.packExplorer.fileActions.createFolder.description',
			onTrigger: async () => {
				const inputWindow = new InputWindow({
					name: 'windows.packExplorer.fileActions.createFolder.name',
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
		DeleteAction(directoryWrapper),
		// {
		// 	icon: 'mdi-pencil-outline',
		// 	name: 'windows.packExplorer.fileActions.rename.name',
		// 	onTrigger: () => {
		// 		directoryWrapper.startRename()
		// 	},
		// },
		{ type: 'divider' },
	]

	showContextMenu(event, [
		...(directoryWrapper.options.isReadOnly ? [] : mutatingActions),

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
