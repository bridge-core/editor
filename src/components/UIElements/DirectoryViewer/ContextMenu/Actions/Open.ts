import { FileWrapper } from '/@/components/UIElements/DirectoryViewer/FileView/FileWrapper'
import { App } from '/@/App'

export const OpenAction = (fileWrapper: FileWrapper) => ({
	icon: 'mdi-plus',
	name: 'actions.open.name',
	description: 'actions.open.description',
	onTrigger: async () => {
		const app = await App.getApp()
		app.project.openFile(fileWrapper.handle)
	},
})
