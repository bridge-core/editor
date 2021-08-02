import { saveOrDownload } from '/@/components/FileSystem/saveOrDownload'
import { ZipDirectory } from '/@/components/FileSystem/Zip/ZipDirectory'
import { App } from '/@/App'
import { isUsingFileSystemPolyfill } from '../../FileSystem/Polyfill'

export async function exportAsBrproject() {
	const app = await App.getApp()
	app.windows.loadingWindow.open()

	/**
	 * .brproject files come in two variants:
	 * - Complete global package including the data/ & extensions/ folder for browsers using the file system polyfill
	 * - Package only including the project files (no data/ & extensions/) for other browsers
	 */
	const zipFolder = new ZipDirectory(
		isUsingFileSystemPolyfill
			? app.fileSystem.baseDirectory
			: app.project.baseDirectory
	)

	try {
		await saveOrDownload(
			`builds/${app.project.name}.brproject`,
			await zipFolder.package(),
			app.project.fileSystem
		)
	} catch (err) {
		console.error(err)
	}

	app.windows.loadingWindow.close()
}
