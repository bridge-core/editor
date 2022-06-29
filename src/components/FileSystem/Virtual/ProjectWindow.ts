import { exportAsBrproject } from '/@/components/Projects/Export/AsBrproject'
import { InformedChoiceWindow } from '/@/components/Windows/InformedChoice/InformedChoice'
import { App } from '/@/App'
import { importNewProject } from '/@/components/Projects/Import/ImportNew'

export async function createVirtualProjectWindow() {
	// Prompt user whether to open new project or to save the current one
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
		description: 'windows.projectChooser.newProject.description',
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
		onTrigger: () => importNewProject(),
	})
}
