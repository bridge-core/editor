import { exportAsBrproject } from '/@/components/Projects/Export/AsBrproject'
import { importFromBrproject } from '/@/components/Projects/Import/fromBrproject'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'
import { InformedChoiceWindow } from '/@/components/Windows/InformedChoice/InformedChoice'
import { AnyFileHandle } from '../Types'
import { App } from '/@/App'

export async function createVirtualProjectWindow() {
	// TODO: Prompt user whether to open new project or to save the current one
	const choiceWindow = new InformedChoiceWindow(
		'windows.projectChooser.title',
		{
			isPersistent: false,
		}
	)
	const actions = await choiceWindow.actionManager

	actions.create({
		icon: 'mdi-plus',
		name: 'windows.projectChooser.newProject.name',
		description: 'windows.projectChooser.saveCurrentProject.description',
		onTrigger: async () => {
			const app = await App.getApp()
			app.windows.createProject.open()
		},
	})

	actions.create({
		icon: 'mdi-content-save-outline',
		name: 'windows.projectChooser.saveCurrentProject.name',
		description: 'windows.projectChooser.saveCurrentProject.description',
		onTrigger: () => exportAsBrproject(),
	})

	actions.create({
		icon: 'mdi-folder-open-outline',
		name: 'windows.projectChooser.openNewProject.name',
		description: 'windows.projectChooser.openNewProject.description',
		onTrigger: async () => {
			// Prompt user to select new project to open
			let projectHandle: AnyFileHandle
			try {
				;[projectHandle] = await window.showOpenFilePicker({
					multiple: false,
					types: [
						{
							description: 'Project',
							accept: {
								'application/zip': ['.brproject'],
							},
						},
					],
				})
			} catch {
				return
			}

			if (!projectHandle.name.endsWith('.brproject'))
				return new InformationWindow({
					description: 'windows.projectChooser.wrongFileType',
				})

			await importFromBrproject(projectHandle)
		},
	})
}
