import { DirectoryWrapper } from '../DirectoryView/DirectoryWrapper'
import { RevealFilePathAction } from './Actions/RevealFilePath'
import { showContextMenu } from '/@/components/ContextMenu/showContextMenu'

export async function showFolderContextMenu(
	event: MouseEvent,
	directoryWrapper: DirectoryWrapper
) {
	showContextMenu(event, [
		// 	{
		// 		icon: 'mdi-file-plus-outline',
		// 		name: 'New File',
		// 		onTrigger: async () => {},
		// 	},
		// 	{
		// 		icon: 'mdi-folder-plus-outline',
		// 		name: 'New File',
		// 		onTrigger: async () => {},
		// 	},
		RevealFilePathAction(directoryWrapper),
		// 	{ type: 'divider' },
		// 	{
		// 		icon: 'mdi-file-search-outline',
		// 		name: 'Find in Folder',
		// 		onTrigger: async () => {},
		// 	},
		// 	{ type: 'divider' },
		// {
		// 	icon: 'mdi-pencil-outline',
		// 	name: 'windows.packExplorer.fileActions.rename.name',
		// 	onTrigger: () => {
		// 		directoryWrapper.startRename()
		// 	},
		// },
		// 	{
		// 		icon: 'mdi-delete-outline',
		// 		name: 'Delete',
		// 		onTrigger: async () => {},
		// 	},
		...(directoryWrapper.options.provideDirectoryContextMenu?.(
			directoryWrapper
		) ?? []),
	])
}
