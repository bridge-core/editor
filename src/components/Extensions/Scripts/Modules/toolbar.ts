import { App } from '/@/App'
import { ToolbarCategory } from '/@/components/Toolbar/ToolbarCategory'
import { IModuleConfig } from '../types'

export const ToolbarModule = async ({ disposables }: IModuleConfig) => ({
	ToolbarCategory,
	actionManager: (await App.getApp()).actionManager,
	addCategory(category: ToolbarCategory) {
		App.toolbar.addCategory(category)
		disposables.push(category)
	},
})
