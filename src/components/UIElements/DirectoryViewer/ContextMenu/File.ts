import { FileWrapper } from '../FileView/FileWrapper'
import { CopyAction } from './Actions/Edit/Copy'
import { OpenInSplitScreenAction } from './Actions/OpenInSplitScreen'
import { OpenWithAction } from './Actions/OpenWith'
import { RevealFilePathAction } from './Actions/RevealPath'
import {
	showContextMenu,
	TActionConfig,
} from '/@/components/ContextMenu/showContextMenu'
import { shareFile } from '/@/components/StartParams/Action/openRawFile'
import { EditAction } from './Actions/Edit'
import { DownloadAction } from './Actions/Download'

export async function showFileContextMenu(
	event: MouseEvent,
	fileWrapper: FileWrapper
) {
	const additionalActions =
		await fileWrapper.options.provideFileContextMenu?.(fileWrapper)

	let revealAction: TActionConfig | null = null
	if (import.meta.env.VITE_IS_TAURI_APP) {
		const { RevealInFileExplorer } = await import(
			'/@/components/UIElements/DirectoryViewer/ContextMenu/Actions/RevealInFileExplorer'
		)

		revealAction = RevealInFileExplorer(fileWrapper)
	} else {
		revealAction = RevealFilePathAction(fileWrapper)
	}

	showContextMenu(event, [
		...(fileWrapper.options.isReadOnly
			? [CopyAction(fileWrapper)]
			: await EditAction(fileWrapper)),
		{ type: 'divider' },

		OpenInSplitScreenAction(fileWrapper),
		await OpenWithAction(fileWrapper),

		{ type: 'divider' },

		{
			type: 'submenu',
			icon: 'mdi-dots-horizontal',
			name: 'actions.more.name',

			actions: [
				{
					icon: 'mdi-share',
					name: 'general.shareFile',
					onTrigger: async () => {
						await shareFile(fileWrapper.handle)
					},
				},
				DownloadAction(fileWrapper),
				revealAction,
			],
		},

		...(additionalActions ?? []),
	])
}
