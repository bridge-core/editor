import { VirtualFileHandle } from '/@/components/FileSystem/Virtual/FileHandle'
import { App } from '/@/App'
import { AnyFileHandle } from '/@/components/FileSystem/Types'
import type { IStartAction } from '../Manager'
import { isContentVisible } from '../../Sidebar/state'
import { strFromU8, strToU8, zlibSync } from 'fflate'

const textEncoder = new TextEncoder()

export const openRawFileAction: IStartAction = {
	type: 'compressed',
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
		await app.fileDropper.importFile(file)
	},
}

export async function shareFile(file: AnyFileHandle) {
	const { compressToEncodedURIComponent } = await import('lz-string')

	const fileContent = await file.getFile().then((file) => file.text())

	if (typeof navigator.share === 'function') {
		const url = new URL(window.location.href)
		// Also share the information to hide sidebar if it's hidden
		console.log(isContentVisible.value)
		if (!isContentVisible.value)
			url.searchParams.set('setSidebarState', 'hidden')

		url.searchParams.set(
			'openRawFile',
			btoa(
				strFromU8(
					zlibSync(strToU8(`${file.name}\n${fileContent}`), {
						level: 9,
					}),
					true
				)
			)
		)

		await navigator
			.share({
				title: file.name,
				text: 'Edit this file with bridge. v2',
				url: url.href,
			})
			.catch(() => {})
	}
}
