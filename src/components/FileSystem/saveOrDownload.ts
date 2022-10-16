import { translate } from '../Locales/Manager'
import { createNotification } from '../Notifications/create'
import { InformationWindow } from '../Windows/Common/Information/InformationWindow'
import { FileSystem } from './FileSystem'
import { isUsingFileSystemPolyfill, isUsingOriginPrivateFs } from './Polyfill'
import { App } from '/@/App'
import { basename, extname } from '/@/utils/path'

export async function saveOrDownload(
	filePath: string,
	fileData: Uint8Array,
	fileSystem: FileSystem
) {
	const notification = createNotification({
		icon: 'mdi-export',
		color: 'success',
		textColor: 'white',
		message: 'general.successfulExport.title',
		isVisible: true,
		onClick: async () => {
			const app = await App.getApp()

			if (
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

	if (!isUsingOriginPrivateFs || isUsingFileSystemPolyfill.value) {
		await fileSystem.writeFile(filePath, fileData)
	}
}

const knownZipExtensions = new Set([
	'.mcpack',
	'.mcaddon',
	'.mcworld',
	'.mctemplate',
	'.brproject',
])
const knownTxtExtensions = new Set(['.mcfunction', '.lang', '.material'])

export function download(fileName: string, fileData: Uint8Array) {
	const extension = extname(fileName)
	let type: string | undefined = undefined

	if (knownZipExtensions.has(extension)) type = 'application/zip'
	else if (knownTxtExtensions.has(extension)) type = 'text/plain'

	const url = URL.createObjectURL(new Blob([fileData], { type }))
	const a = document.createElement('a')
	a.download = fileName
	a.href = url
	a.click()

	URL.revokeObjectURL(url)
}
