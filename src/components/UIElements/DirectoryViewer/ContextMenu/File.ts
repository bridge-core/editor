import { FileWrapper } from '../FileView/FileWrapper'
import { CopyAction } from './Actions/Copy'
import { DeleteAction } from './Actions/Delete'
import { OpenAction } from './Actions/Open'
import { OpenInSplitScreenAction } from './Actions/OpenInSplitScreen'
import { PasteAction } from './Actions/Paste'
import { RenameAction } from './Actions/Rename'
import { RevealFilePathAction } from './Actions/RevealFilePath'
import { App } from '/@/App'
import { showContextMenu } from '/@/components/ContextMenu/showContextMenu'
import { shareFile } from '/@/components/StartParams/Action/openRawFile'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'

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
