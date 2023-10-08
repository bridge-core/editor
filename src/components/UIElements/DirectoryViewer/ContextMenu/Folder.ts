import { DirectoryWrapper } from '../DirectoryView/DirectoryWrapper'
import { DownloadAction } from './Actions/Download'
import { EditAction } from './Actions/Edit'
import { CopyAction } from './Actions/Edit/Copy'
import { FindInFolderAction } from './Actions/FindInFolder'
import { ImportFileAction } from './Actions/ImportFile'
import { RefreshAction } from './Actions/Refresh'
import { RevealFilePathAction } from './Actions/RevealPath'
import { App } from '/@/App'
import {
	showContextMenu,
	TActionConfig,
} from '/@/components/ContextMenu/showContextMenu'
import { InputWindow } from '/@/components/Windows/Common/Input/InputWindow'
import { tryCreateFile } from '/@/utils/file/tryCreateFile'
import { tryCreateFolder } from '/@/utils/file/tryCreateFolder'

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

			onTrigger: async () => {
				const inputWindow = new InputWindow({
					name: 'actions.createFile.name',
					label: 'general.fileName',
					default: '',
				})
				const name = await inputWindow.fired
				if (!name) return

				const { type, handle } = await tryCreateFile({
					directoryHandle: directoryWrapper.handle,
					name,
				})

				if (type === 'cancel') return

				if (handle) {
					app.project.updateHandle(handle)
					// Open file in new tab
					await app.project.openFile(handle, {
						selectTab: true,
					})
				}

				directoryWrapper.refresh()
			},
		},
		{
			icon: 'mdi-folder-plus-outline',
			name: 'actions.createFolder.name',

			onTrigger: async () => {
				const inputWindow = new InputWindow({
					name: 'actions.createFolder.name',
					label: 'general.folderName',
					default: '',
				})
				const name = await inputWindow.fired
				if (!name) return

				const { type } = await tryCreateFolder({
					directoryHandle: directoryWrapper.handle,
					name: name,
				})
				if (type === 'cancel') return

				// Refresh pack explorer
				directoryWrapper.refresh()
			},
		},
		...(await EditAction(directoryWrapper, options)),
		{ type: 'divider' },
	]).filter((action) => action !== null)

	const additionalActions =
		await directoryWrapper.options.provideDirectoryContextMenu?.(
			directoryWrapper
		)

	let revealAction: TActionConfig | null = null
	if (import.meta.env.VITE_IS_TAURI_APP) {
		const { RevealInFileExplorer } = await import(
			'/@/components/UIElements/DirectoryViewer/ContextMenu/Actions/RevealInFileExplorer'
		)

		revealAction = RevealInFileExplorer(directoryWrapper)
	} else {
		revealAction = RevealFilePathAction(directoryWrapper)
	}

	showContextMenu(event, [
		...(directoryWrapper.options.isReadOnly
			? [
					FindInFolderAction(directoryWrapper),
					CopyAction(directoryWrapper),
			  ]
			: mutatingActions),

		{
			type: 'submenu',
			icon: 'mdi-dots-horizontal',
			name: 'actions.more.name',

			actions: [
				...(directoryWrapper.options.isReadOnly
					? []
					: [
							ImportFileAction(directoryWrapper),
							FindInFolderAction(directoryWrapper),
					  ]),

				RefreshAction(directoryWrapper),
				DownloadAction(directoryWrapper),
				revealAction,
			],
		},

		...(additionalActions ?? []),
	])
}
