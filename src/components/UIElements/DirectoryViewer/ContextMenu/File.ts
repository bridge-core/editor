import { DirectoryWrapper } from '../DirectoryView/DirectoryWrapper'
import { FileWrapper } from '../FileView/FileWrapper'
import { showContextMenu } from '/@/components/ContextMenu/showContextMenu'
import { shareFile } from '/@/components/StartParams/Action/openRawFile'

export async function showFileContextMenu(
	event: MouseEvent,
	fileWrapper: FileWrapper
) {
	showContextMenu(event, [
		{
			icon: 'mdi-share',
			name: 'general.shareFile',
			onTrigger: async () => {
				await shareFile(fileWrapper.handle)
			},
		},
		{
			icon: 'mdi-eye-outline',
			name: 'Reveal File Path',
			onTrigger: async () => {},
		},
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
	])
}
