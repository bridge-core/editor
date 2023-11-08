import { FileSystem } from '../FileSystem/FileSystem'
import { showFolderPicker } from '../FileSystem/Pickers/showFolderPicker'
import { translate } from '../Locales/Manager'
import { ConfirmationWindow } from '../Windows/Common/Confirm/ConfirmWindow'
import { InformationWindow } from '../Windows/Common/Information/InformationWindow'
import { App } from '/@/App'

export async function importProjects() {
	const app = await App.getApp()

	// Show warning if the user has projects already
	const projects = await app.fileSystem.readdir('projects')

	if (projects.length > 0) {
		const confirmWindow = new ConfirmationWindow({
			description:
				'packExplorer.noProjectView.importOldProjects.confirmOverwrite',
		})
		const choice = await confirmWindow.fired

		if (!choice) return
	}

	app.windows.loadingWindow.open()

	const bridgeProjects = await showFolderPicker({ multiple: true })

	if (!bridgeProjects) {
		app.windows.loadingWindow.close()
		return
	}

	let didSelectProject = false
	for (const bridgeProject of bridgeProjects) {
		const bridgeProjectFs = new FileSystem(bridgeProject)
		// Ensure that the folder is a bridge project by checking for the config.json fike
		if (!(await bridgeProjectFs.fileExists('config.json'))) {
			new InformationWindow({
				title: `[${translate('toolbar.project.name')}: "${
					bridgeProject.name
				}"]`,
				description:
					'packExplorer.noProjectView.importOldProjects.notABridgeProject',
			})
			continue
		}

		const newProjectDir = await app.fileSystem.getDirectoryHandle(
			`projects/${bridgeProject.name}`,
			{ create: true }
		)
		await app.fileSystem.copyFolderByHandle(
			bridgeProject,
			newProjectDir,
			new Set(['builds', '.git'])
		)

		// Load projects and only select the first one
		app.projectManager.addProject(
			bridgeProject,
			true,
			true,
			!didSelectProject
		)
		if (!didSelectProject) didSelectProject = true
	}

	app.windows.loadingWindow.close()
}
