import { IModuleConfig } from '../types'
import { App } from '/@/App'
import { showFolderPicker } from '/@/components/FileSystem/Pickers/showFolderPicker'
import { AnyHandle } from '/@/components/FileSystem/Types'
import { IFolderHandler } from '/@/components/ImportFolder/Manager'
import {
	IPluginOpenWithAction,
	pluginActionStore,
} from '/@/components/UIElements/DirectoryViewer/ContextMenu/Actions/OpenWith'

interface IPickDirectoryOptions {
	multiple?: boolean
}

export const ImportModule = ({ disposables }: IModuleConfig) => ({
	addFolderImporter: async (handle: IFolderHandler) => {
		const app = await App.getApp()
		disposables.push(app.folderImportManager.addImporter(handle))
	},

	async importHandle(handle: AnyHandle) {
		const app = await App.getApp()
		await app.fileDropper.import(handle)
	},

	registerOpenWithHandler: (handler: IPluginOpenWithAction) => {
		pluginActionStore.add(handler)

		const disposable = {
			dispose: () => {
				pluginActionStore.delete(handler)
			},
		}
		disposables.push(disposable)

		return disposable
	},

	showDirectoryPicker: async (opts: IPickDirectoryOptions) => {
		await showFolderPicker(opts)
	},
})
