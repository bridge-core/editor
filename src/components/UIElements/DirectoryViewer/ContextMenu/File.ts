import { FileWrapper } from '../FileView/FileWrapper'
import { CopyAction } from './Actions/Edit/Copy'
import { OpenAction } from './Actions/Open'
import { OpenInSplitScreenAction } from './Actions/OpenInSplitScreen'
import { OpenWithAction } from './Actions/OpenWith'
import { RevealFilePathAction } from './Actions/RevealPath'
import { showContextMenu } from '/@/components/ContextMenu/showContextMenu'
import { shareFile } from '/@/components/StartParams/Action/openRawFile'
import { EditAction } from './Actions/Edit'
import { DownloadAction } from './Actions/Download'

export async function showFileContextMenu(
	event: MouseEvent,
	fileWrapper: FileWrapper
) {
	const additionalActions = await fileWrapper.options.provideFileContextMenu?.(
		fileWrapper
	)

	showContextMenu(event, [
		OpenAction(fileWrapper),
		await OpenWithAction(fileWrapper),
		OpenInSplitScreenAction(fileWrapper),
		{ type: 'divider' },

		fileWrapper.options.isReadOnly
			? CopyAction(fileWrapper)
			: await EditAction(fileWrapper),
		{ type: 'divider' },
		{
			icon: 'mdi-share',
			name: 'general.shareFile',
			onTrigger: async () => {
				await shareFile(fileWrapper.handle)
			},
		},
		DownloadAction(fileWrapper),
		RevealFilePathAction(fileWrapper),

		...(additionalActions ?? []),
	])
}
