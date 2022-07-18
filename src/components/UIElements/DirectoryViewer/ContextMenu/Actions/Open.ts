import { FileWrapper } from '/@/components/UIElements/DirectoryViewer/FileView/FileWrapper'
import { App } from '/@/App'

export const OpenAction = (fileWrapper: FileWrapper) => ({
	icon: 'mdi-plus',
	name: 'actions.open.name',

	onTrigger: async () => {
		const app = await App.getApp()
		app.project.openFile(fileWrapper.handle, {
			readOnlyMode: fileWrapper.options.isReadOnly ? 'forced' : 'off',
		})
	},
})
