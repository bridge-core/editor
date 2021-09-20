import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { saveOrDownload } from '/@/components/FileSystem/saveOrDownload'
import { ZipDirectory } from '/@/components/FileSystem/Zip/ZipDirectory'
import { App } from '/@/App'
import { createNotification } from '/@/components/Notifications/create'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'
import { PackType } from '../../Data/PackType'

export async function exportAsMcaddon() {
	const app = await App.getApp()
	app.windows.loadingWindow.open()

	// Increment manifest versions if using a file system polyfill
	// This allows user to simply import the file into Minecraft even if the same pack
	// with a lower version number is already installed
	if (isUsingFileSystemPolyfill) {
		const fs = app.project.fileSystem

		let manifests: Record<string, any> = {}

		for (const pack of app.project.getPacks()) {
			const packPath = PackType.getPath(pack)

			if (await fs.fileExists(`${packPath}/manifest.json`)) {
				const manifest =
					(await fs.readJSON(`${packPath}/manifest.json`)) ?? {}
				const [major, minor, patch] = <[number, number, number]>(
					manifest.header?.version
				) ?? [0, 0, 0]

				// Increment patch version
				const newVersion = [major, minor, patch + 1]

				manifests[`${packPath}/manifest.json`] = {
					...manifest,
					header: {
						...(manifest.header ?? {}),
						version: newVersion,
					},
				}
			}
		}

		// Update manifest dependency versions
		const allManifests = Object.values(manifests)
		for (const manifest of allManifests) {
			if (!Array.isArray(manifest.dependencies)) continue

			manifest.dependencies.forEach((dep: any) => {
				const depManifest = allManifests.find(
					(manifest) => manifest.header.uuid === dep.uuid
				)
				if (!depManifest) return

				dep.version = depManifest.header.version
			})
		}

		// Write all manifest changes back to disk
		for (const [path, manifest] of Object.entries(manifests)) {
			await fs.writeJSON(path, manifest, true)
		}
	}

	await app.project.compilerManager.start('default', 'build')

	const zipFolder = new ZipDirectory(
		await app.project.fileSystem.getDirectoryHandle('builds/dist', {
			create: true,
		})
	)
	const savePath = `projects/${app.project.name}/builds/${app.project.name}.mcaddon`

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
