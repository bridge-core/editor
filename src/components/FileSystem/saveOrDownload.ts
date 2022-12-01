import { translate } from '../Locales/Manager'
import { createNotification } from '../Notifications/create'
import { InformationWindow } from '../Windows/Common/Information/InformationWindow'
import { FileSystem } from './FileSystem'
import { isUsingFileSystemPolyfill, isUsingOriginPrivateFs } from './Polyfill'
import { App } from '/@/App'
import { basename, extname, join } from '/@/utils/path'
import { revealInFileExplorer } from '/@/utils/revealInFileExplorer'

export async function saveOrDownload(
	filePath: string,
	fileData: Uint8Array,
	fileSystem: FileSystem
) {
	if (
		import.meta.env.VITE_IS_TAURI_APP ||
		!isUsingOriginPrivateFs ||
		isUsingFileSystemPolyfill.value
	) {
		await fileSystem.writeFile(filePath, fileData)
	}

	const notification = createNotification({
		icon: 'mdi-download',
		color: 'success',
		textColor: 'white',
		message: 'general.successfulExport.title',
		isVisible: true,
		onClick: async () => {
			const app = await App.getApp()

			if (import.meta.env.VITE_IS_TAURI_APP) {
				const { appLocalDataDir } = await import('@tauri-apps/api/path')

				revealInFileExplorer(
					join(await appLocalDataDir(), 'bridge', filePath)
				)
			} else if (
				app.project.isLocal ||
				isUsingOriginPrivateFs ||
				isUsingFileSystemPolyfill.value
			) {
				download(basename(filePath), fileData)
			} else {
				new InformationWindow({
					description: `[${translate(
						'general.successfulExport.description'
					)}: "${filePath}"]`,
				})
			}

			notification.dispose()
		},
	})
}

const knownExtensions = new Set([
	'.mcpack',
	'.mcaddon',
	'.mcworld',
	'.mctemplate',
	'.brproject',

	'.mcfunction',
	'.lang',
	'.material',
])

export function download(fileName: string, fileData: Uint8Array) {
	const extension = extname(fileName)
	let type: string | undefined = undefined

	// Maintain the extension from the fileName, if the file that is being downloaded has a known extension
	if (knownExtensions.has(extension)) type = 'application/file-export'

	const url = URL.createObjectURL(new Blob([fileData], { type }))
	const a = document.createElement('a')
	a.download = fileName
	a.href = url
	a.click()

	URL.revokeObjectURL(url)
}
