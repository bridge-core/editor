import { IModuleConfig } from '../types'
import { App } from '/@/App'
import { AnyHandle } from '/@/components/FileSystem/Types'
import { IFolderHandler } from '/@/components/ImportFolder/manager'

export const ImportModule = ({ disposables }: IModuleConfig) => ({
	addFolderImporter: async (handle: IFolderHandler) => {
		const app = await App.getApp()
		disposables.push(app.folderImportManager.addImporter(handle))
	},

	async importHandle(handle: AnyHandle) {
		const app = await App.getApp()
		await app.fileDropper.import(handle)
	},
})
