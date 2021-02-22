import { App } from '/@/App'

export function loadAsDataURL(filePath: string) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader()

		App.ready.once(async app => {
			try {
				const fileHandle = await app.fileSystem.getFileHandle(filePath)
				const file = await fileHandle.getFile()

				reader.addEventListener('load', () => {
					resolve(<string>reader.result)
				})
				reader.addEventListener('error', reject)
				reader.readAsDataURL(file)
			} catch {
				reject(`File does not exist: "${filePath}"`)
			}
		})
	})
}
