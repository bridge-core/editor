import { saveOrDownload } from '/@/components/FileSystem/saveOrDownload'
import { ZipDirectory } from '/@/components/FileSystem/Zip/ZipDirectory'
import { App } from '/@/App'
import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'

export async function exportAsBrproject(name?: string) {
	const app = App.instance
	app.windows.loadingWindow.open()

	const savePath = `${app.project.projectPath}/builds/${
		name ?? app.project.name
	}.brproject`

	/**
	 * .brproject files come in two variants:
	 * - Complete global package including the data/ & extensions/ folder for browsers using the file system polyfill
	 * - Package only including the project files (no data/ & extensions/) for other browsers
	 */
	const zipFolder = new ZipDirectory(
		isUsingFileSystemPolyfill.value
			? app.fileSystem.baseDirectory
			: app.project.baseDirectory
	)

	try {
		await saveOrDownload(
			savePath,
			await zipFolder.package(new Set(['builds'])),
			app.fileSystem
		)
	} catch (err) {
		console.error(err)
	}

	app.windows.loadingWindow.close()
}
