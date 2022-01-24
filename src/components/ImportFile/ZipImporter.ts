import { FileDropper } from '/@/components/FileDropper/FileDropper'
import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { Unzipper } from '/@/components/FileSystem/Zip/Unzipper'
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
		const tmpHandle = await fs.getDirectoryHandle('import', {
			create: true,
		})

		// Unzip to figure out how to handle the file
		const unzipper = new Unzipper(tmpHandle)

		const file = await fileHandle.getFile()
		const data = new Uint8Array(await file.arrayBuffer())
		unzipper.createTask(app.taskManager)
		await unzipper.unzip(data)

		// If the "extensions", "projects", or "data" folders exist in the zip, assume it can be imported as a .brproject file
		// If there is a manifest in the project subfolder, assume it can be imported as a .mcaddon file
		if (
			(await fs.directoryExists('import/extensions')) ||
			(await fs.directoryExists('import/projects')) ||
			(await fs.directoryExists('import/data'))
		)
			await importFromBrproject(fileHandle, false, false)
		else {
			for await (const pack of tmpHandle.values()) {
				if (await fs.fileExists(`import/${pack.name}/manifest.json`)) {
					await importFromMcaddon(fileHandle, false, false)
					break
				}
			}
		}
	}
}
