import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { saveOrDownload } from '/@/components/FileSystem/saveOrDownload'
import { ZipDirectory } from '/@/components/FileSystem/Zip/ZipDirectory'
import { App } from '/@/App'

export async function exportAsMcaddon() {
	const app = await App.getApp()
	app.windows.loadingWindow.open()

	await app.project.compilerManager.start('default.json', 'build')

	const zipFolder = new ZipDirectory(
		await app.project.fileSystem.getDirectoryHandle('builds/dist', {
			create: true,
		})
	)

	try {
		await saveOrDownload(
			`builds/${app.project.name}.mcaddon`,
			await zipFolder.package(),
			app.project.fileSystem
		)
	} catch (err) {
		console.error(err)
	}

	app.windows.loadingWindow.close()
}
