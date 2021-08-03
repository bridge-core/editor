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
	let savePath = `builds/${app.project.name}.brproject`

	try {
		await saveOrDownload(
			savePath,
			await zipFolder.package(),
			app.project.fileSystem
		)
	} catch (err) {
		console.error(err)
	}

	let projectName = app.project.name
	if (!isUsingFileSystemPolyfill) {
		const notification = createNotification({
			icon: 'mdi-export',
			color: 'success',
			textColor: 'white',
			message: 'general.successfulExport.title',
			onClick: () => {
				new InformationWindow({
					description: `[${app.locales.translate(
						'general.successfulExport.description'
					)}: "projects/${projectName}/${savePath}"]`,
				})
				notification.dispose()
			},
		})
	}

	app.windows.loadingWindow.close()
}
