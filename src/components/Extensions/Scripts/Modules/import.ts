import { IModuleConfig } from '../types'
import { App } from '/@/App'
import { IFolderHandler } from '/@/components/ImportFolder/manager'

export const ImportModule = ({ disposables }: IModuleConfig) => ({
	addFolderImporter: async (handle: IFolderHandler) => {
		const app = await App.getApp()
		disposables.push(app.folderImportManager.addImporter(handle))
	},
})
