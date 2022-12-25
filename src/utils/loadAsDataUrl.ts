import { FileSystem } from '../components/FileSystem/FileSystem'
import { AnyFileHandle } from '../components/FileSystem/Types'
import { VirtualFile } from '../components/FileSystem/Virtual/File'
import { App } from '/@/App'

export async function loadAsDataURL(filePath: string, fileSystem?: FileSystem) {
	if (!fileSystem) {
		const app = await App.getApp()
		fileSystem = app.fileSystem
	}

	return new Promise<string>(async (resolve, reject) => {
		const reader = new FileReader()

		try {
			const fileHandle = await fileSystem!.getFileHandle(filePath)
			const file = await fileHandle.getFile()

			reader.addEventListener('load', () => {
				resolve(<string>reader.result)
			})
			reader.addEventListener('error', reject)
			reader.readAsDataURL(
				file instanceof VirtualFile ? await file.toBlob() : file
			)
		} catch {
			reject(`File does not exist: "${filePath}"`)
		}
	})
}

export function loadHandleAsDataURL(fileHandle: AnyFileHandle) {
	return new Promise<string>(async (resolve, reject) => {
		const reader = new FileReader()

		try {
			const file = await fileHandle.getFile()

			reader.addEventListener('load', () => {
				resolve(<string>reader.result)
			})
			reader.addEventListener('error', reject)

			reader.readAsDataURL(
				file instanceof VirtualFile ? await file.toBlob() : file
			)
		} catch {
			reject(`File does not exist: "${fileHandle.name}"`)
		}
	})
}
