import { createNotification } from '../Notifications/create'
import { InformationWindow } from '../Windows/Common/Information/InformationWindow'
import { FileSystem } from './FileSystem'
import { isUsingFileSystemPolyfill } from './Polyfill'
import { App } from '/@/App'
import { basename } from '/@/utils/path'

export async function saveOrDownload(
	filePath: string,
	fileData: Uint8Array,
	fileSystem: FileSystem
) {
	const app = await App.getApp()

	const notification = createNotification({
		icon: 'mdi-export',
		color: 'success',
		textColor: 'white',
		message: 'general.successfulExport.title',
		onClick: () => {
			if (isUsingFileSystemPolyfill) {
				download(basename(filePath), fileData)
			} else {
				new InformationWindow({
					description: `[${app.locales.translate(
						'general.successfulExport.description'
					)}: "${filePath}"]`,
				})
			}

			notification.dispose()
		},
	})

	if (!isUsingFileSystemPolyfill) {
		await fileSystem.writeFile(filePath, fileData)
	}
}

export function download(fileName: string, fileData: Uint8Array) {
	const url = URL.createObjectURL(new Blob([fileData]))
	const a = document.createElement('a')
	a.download = fileName
	a.href = url
	a.click()

	URL.revokeObjectURL(url)
}
