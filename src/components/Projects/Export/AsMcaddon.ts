import {
	isUsingFileSystemPolyfill,
	isUsingOriginPrivateFs,
} from '/@/components/FileSystem/Polyfill'
import { saveOrDownload } from '/@/components/FileSystem/saveOrDownload'
import { ZipDirectory } from '/@/components/FileSystem/Zip/ZipDirectory'
import { App } from '/@/App'

export async function exportAsMcaddon() {
	const app = await App.getApp()
	app.windows.loadingWindow.open()

	// Increment manifest versions if using a file system polyfill
	// This allows user to simply import the file into Minecraft even if the same pack
	// with a lower version number is already installed
	if (isUsingOriginPrivateFs || isUsingFileSystemPolyfill.value) {
		const fs = app.fileSystem

		let manifests: Record<string, any> = {}

		for (const pack of app.project.getPacks()) {
			const manifestPath = app.project.config.resolvePackPath(
				pack,
				'manifest.json'
			)

			if (await fs.fileExists(manifestPath)) {
				let manifest
				try {
					manifest = (await fs.readJSON(manifestPath)) ?? {}
				} catch {
					continue
				}

				const [major, minor, patch] = <[number, number, number]>(
					manifest.header?.version
				) ?? [0, 0, 0]

				// Increment patch version
				const newVersion = [major, minor, patch + 1]

				manifests[manifestPath] = {
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

	const service = await app.project.createDashService('production')
	await service.setup()
	await service.build()

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
