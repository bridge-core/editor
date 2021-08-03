import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { Unzipper } from '/@/components/FileSystem/Zip/Unzipper'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { SettingsWindow } from '/@/components/Windows/Settings/SettingsWindow'
import { exportAsBrproject } from '../Export/AsBrproject'
import { App } from '/@/App'

export async function importFromBrproject(
	fileHandle: AnyFileHandle,
	isFirstImport = false
) {
	console.log('HERE')
	const app = await App.getApp()
	const fs = app.fileSystem
	const tmpHandle = await fs.getDirectoryHandle('import', {
		create: true,
	})
	const unzipper = new Unzipper(tmpHandle)

	if (!isFirstImport) await app.projectManager.projectReady.fired

	// Unzip .brproject file
	const file = await fileHandle.getFile()
	const data = new Uint8Array(await file.arrayBuffer())
	unzipper.createTask(app.taskManager)
	await unzipper.unzip(data)
	let importFrom = 'import'

	if (!(await fs.fileExists('import/config.json'))) {
		// The .brproject file contains data/, projects/ & extensions/ folder
		// We need to change the folder structure to process it correctly
		if (isUsingFileSystemPolyfill) {
			// Only load settings & extension if using the polyfill
			try {
				await fs.rename('import/data', 'data')
			} catch {}
			try {
				await fs.rename('import/extensions', 'extensions')
			} catch {}

			// Reload settings & extensions
			await SettingsWindow.loadSettings(app)
			await app.extensionLoader.reload()
			app.locales.setDefaultLanguage()
		}

		// Get project from projects/ folder
		try {
			const [projectName] = await fs.readdir('import/projects')
			importFrom = `import/projects/${projectName}`
		} catch {
			return
		}
	}

	// Ask user whether he wants to save the current project if we are going to delete it later in the import process
	if (isUsingFileSystemPolyfill && !isFirstImport) {
		const confirmWindow = new ConfirmationWindow({
			description:
				'windows.projectChooser.openNewProject.saveCurrentProject',
			cancelText: 'general.no',
			confirmText: 'general.yes',
		})
		if (await confirmWindow.fired) {
			await exportAsBrproject()
		}
	}

	// Get the project name from the config.json file
	const { name } = await fs.readJSON(`${importFrom}/config.json`)
	// Move imported project to the user's project directory
	await fs.rename(importFrom, `projects/${name}`)

	// Get current project name
	let currentProjectName: string | undefined
	if (!isFirstImport) currentProjectName = app.project.name

	// Add new project
	await app.projectManager.addProject(
		await fs.getDirectoryHandle(`projects/${name}`),
		true
	)
	// Remove old project if browser is using fileSystem polyfill
	if (isUsingFileSystemPolyfill && !isFirstImport)
		await app.projectManager.removeProject(currentProjectName!)

	await fs.unlink('import')
}
