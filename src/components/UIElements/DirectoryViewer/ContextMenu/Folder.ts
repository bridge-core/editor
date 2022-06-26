import { DirectoryWrapper } from '../DirectoryView/DirectoryWrapper'
import { showContextMenu } from '/@/components/ContextMenu/showContextMenu'

export async function showFolderContextMenu(
	event: MouseEvent,
	directoryWrapper: DirectoryWrapper
) {
	// showContextMenu(event, [
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
	// 	{
	// 		icon: 'mdi-eye-outline',
	// 		name: 'Reveal File Path',
	// 		onTrigger: async () => {},
	// 	},
	// 	{ type: 'divider' },
	// 	{
	// 		icon: 'mdi-file-search-outline',
	// 		name: 'Find in Folder',
	// 		onTrigger: async () => {},
	// 	},
	// 	{ type: 'divider' },
	// 	{
	// 		icon: 'mdi-pencil-outline',
	// 		name: 'Rename',
	// 		onTrigger: async () => {},
	// 	},
	// 	{
	// 		icon: 'mdi-delete-outline',
	// 		name: 'Delete',
	// 		onTrigger: async () => {},
	// 	},
	// ])
}
