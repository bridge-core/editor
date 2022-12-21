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
	 *
	 * The global package variant is deprecated now because we persist settings and extensions in the browser's local storage
	 */
	const zipFolder = new ZipDirectory(app.project.baseDirectory)

	const zipFile = await zipFolder.package(new Set(['builds']))

	try {
		await saveOrDownload(savePath, zipFile, app.fileSystem)
	} catch (err) {
		console.error(err)
	}

	app.windows.loadingWindow.close()
}
