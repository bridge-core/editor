import { IModuleConfig } from '../types'
import { App } from '/@/App'
import { FileTab } from '/@/components/TabSystem/FileTab'
import {
	ITabActionConfig,
	ITabPreviewConfig,
} from '/@/components/TabSystem/TabActions/Provider'

export const TabActionsModule = async ({ disposables }: IModuleConfig) => ({
	/**
	 * Add the default tab actions for the specific file tab
	 * @param tab
	 */
	addTabActions: async (tab: FileTab) => {
		const app = await App.getApp()

		app.project.tabActionProvider.addTabActions(tab)
	},

	register: async (definition: ITabActionConfig) => {
		const app = await App.getApp()
		const disposable = app.project.tabActionProvider.register(definition)

		disposables.push(disposable)

		return disposable
	},

	registerPreview: async (definition: ITabPreviewConfig) => {
		const app = await App.getApp()
		const disposable = app.project.tabActionProvider.registerPreview(
			definition
		)

		disposables.push(disposable)

		return disposable
	},
})
