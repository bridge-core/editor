import { saveOrDownload } from '/@/components/FileSystem/saveOrDownload'
import { ZipDirectory } from '/@/components/FileSystem/Zip/ZipDirectory'
import { App } from '/@/App'
import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { createNotification } from '/@/components/Notifications/create'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'

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
	const savePath = `projects/${app.project.name}/builds/${app.project.name}.brproject`

	try {
		await saveOrDownload(
			savePath,
			await zipFolder.package(),
			app.fileSystem
		)
	} catch (err) {
		console.error(err)
	}

	app.windows.loadingWindow.close()
}
