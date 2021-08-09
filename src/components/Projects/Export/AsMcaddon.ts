import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { saveOrDownload } from '/@/components/FileSystem/saveOrDownload'
import { ZipDirectory } from '/@/components/FileSystem/Zip/ZipDirectory'
import { App } from '/@/App'
import { createNotification } from '/@/components/Notifications/create'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'

export async function exportAsMcaddon() {
	const app = await App.getApp()
	app.windows.loadingWindow.open()

	await app.project.compilerManager.start('default', 'build')

	const zipFolder = new ZipDirectory(
		await app.project.fileSystem.getDirectoryHandle('builds/dist', {
			create: true,
		})
	)
	const savePath = `builds/${app.project.name}.mcaddon`

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
