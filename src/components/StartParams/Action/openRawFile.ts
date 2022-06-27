import { VirtualFileHandle } from '/@/components/FileSystem/Virtual/FileHandle'
import { App } from '/@/App'
import { AnyFileHandle } from '/@/components/FileSystem/Types'

const textEncoder = new TextEncoder()

export const openRawFileAction = {
	name: 'openRawFile',
	onTrigger: async (value: string) => {
		const firstNewLine = value.indexOf('\n')

		const [fileName, fileData] = [
			value.slice(0, firstNewLine),
			value.slice(firstNewLine + 1),
		]

		const file = new VirtualFileHandle(
			null,
			fileName,
			textEncoder.encode(fileData),
			true
		)
		const app = await App.getApp()
		await app.projectManager.projectReady.fired
		await app.project.openFile(file, {
			isTemporary: false,
			selectTab: true,
		})
	},
}

export async function shareFile(file: AnyFileHandle) {
	const { compressToEncodedURIComponent } = await import('lz-string')

	const fileContent = await file.getFile().then((file) => file.text())

	if (typeof navigator.share === 'function') {
		const url = new URL(window.location.href)
		url.searchParams.set(
			'openRawFile',
			compressToEncodedURIComponent(`${file.name}\n${fileContent}`)
		)

		await navigator.share({
			title: 'Share file',
			text: 'Share file',
			url: url.href,
		})
	}
}
