import { SimpleAction } from '../Actions/SimpleAction'
import { AnyDirectoryHandle, AnyFileHandle } from '../FileSystem/Types'
import { addCommandBarAction } from './State'
import { App } from '/@/App'
import { IDisposable } from '/@/types/disposable'
import { loadAllFiles } from '/@/utils/file/loadAllFiles'

export async function addFilesToCommandBar(
	directoryHandle: AnyDirectoryHandle,
	color?: string
) {
	const files = await loadAllFiles(directoryHandle)
	let disposables: IDisposable[] = []

	for (const file of files) {
		const action = new SimpleAction({
			icon: 'mdi-file-outline',
			color,
			name: `[${file.path}]`,
			description: 'actions.openFile.name',
			onTrigger: async () => {
				const app = await App.getApp()
				app.project.openFile(file.handle)
			},
		})

		disposables.push(addCommandBarAction(action))
	}

	return {
		dispose: () => {
			disposables.forEach((disposable) => disposable.dispose())
			disposables = []
		},
	}
}
