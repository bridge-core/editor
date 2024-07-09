import { FileDropper } from '/@/components/FileDropper/FileDropper'
import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { StreamingUnzipper } from '/@/components/FileSystem/Zip/StreamingUnzipper'
import { FileImporter } from './Importer'
import { App } from '/@/App'
import { importFromBrproject } from '/@/components/Projects/Import/fromBrproject'
import { importFromMcaddon } from '/@/components/Projects/Import/fromMcaddon'

export class ZipImporter extends FileImporter {
	constructor(fileDropper: FileDropper) {
		super(['.zip'], fileDropper)
	}

	async onImport(fileHandle: AnyFileHandle) {
		const app = await App.getApp()
		const fs = app.fileSystem

		if (await fs.directoryExists('import')) await fs.unlink('import')

		const tmpHandle = await fs.getDirectoryHandle('import', {
			create: true,
		})

		// Unzip to figure out how to handle the file
		const unzipper = new StreamingUnzipper(tmpHandle)

		const file = await fileHandle.getFile()
		const data = new Uint8Array(await file.arrayBuffer())
		unzipper.createTask(app.taskManager)
		await unzipper.unzip(data)

		// If the "extensions", "projects", or "data" folders exist in the zip, assume it can be imported as a .brproject file
		// If the "config.json" file exists in the zip, assume it can be imported as a .brproject file
		// If there is a manifest in the project subfolder, assume it can be imported as a .mcaddon file
		if (
			(await fs.fileExists('import/config.json')) ||
			(await fs.directoryExists('import/data')) ||
			(await fs.directoryExists('import/projects')) ||
			(await fs.directoryExists('import/extensions'))
		) {
			await importFromBrproject(fileHandle, false)
		} else {
			let foundPack = false

			for await (const pack of tmpHandle.values()) {
				if (await fs.fileExists(`import/${pack.name}/manifest.json`)) {
					foundPack = true

					await importFromMcaddon(fileHandle, false)
					break
				}
			}

			if (foundPack) return

			app.folderImportManager.onImportFolder(
				await fs.getDirectoryHandle('import')
			)
			// No addon packs were found, we'll try importing the folder
		}
	}
}
