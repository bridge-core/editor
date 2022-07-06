import { FileWrapper } from '../FileView/FileWrapper'
import { CopyAction } from './Actions/Copy'
import { DeleteAction } from './Actions/Delete'
import { OpenAction } from './Actions/Open'
import { OpenInSplitScreenAction } from './Actions/OpenInSplitScreen'
import { OpenWithAction } from './Actions/OpenWith'
import { PasteAction } from './Actions/Paste'
import { RenameAction } from './Actions/Rename'
import { RevealFilePathAction } from './Actions/RevealFilePath'
import { showContextMenu } from '/@/components/ContextMenu/showContextMenu'
import { shareFile } from '/@/components/StartParams/Action/openRawFile'

export async function showFileContextMenu(
	event: MouseEvent,
	fileWrapper: FileWrapper
) {
	const mutatingActions = <const>[
		CopyAction(fileWrapper),
		PasteAction(fileWrapper.getParent()!),
		RenameAction(fileWrapper),
		DeleteAction(fileWrapper),
	]

	showContextMenu(event, [
		OpenAction(fileWrapper),
		await OpenWithAction(fileWrapper),
		OpenInSplitScreenAction(fileWrapper),
		{ type: 'divider' },

		...(fileWrapper.options.isReadOnly
			? [CopyAction(fileWrapper)]
			: mutatingActions),
		{ type: 'divider' },
		{
			icon: 'mdi-share',
			name: 'general.shareFile',
			onTrigger: async () => {
				await shareFile(fileWrapper.handle)
			},
		},
		RevealFilePathAction(fileWrapper),

		...(fileWrapper.options.provideFileContextMenu?.(fileWrapper) ?? []),
	])
}
