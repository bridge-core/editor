import { App } from '/@/App'
import { SimpleAction } from '../../Actions/SimpleAction'

export const recompileChangesConfig = {
	icon: 'mdi-cog-outline',
	name: 'actions.recompileChanges.name',
	description: 'actions.recompileChanges.description',
	onTrigger: async () => {
		const app = await App.getApp()
		const project = app.project

		project.packIndexer.deactivate()
		await project.packIndexer.activate(true)

		const [changedFiles, deletedFiles] = await project.packIndexer.fired

		await project.compilerService.start(changedFiles, deletedFiles)
	},
}

export const recompileChangesAction = new SimpleAction(recompileChangesConfig)
