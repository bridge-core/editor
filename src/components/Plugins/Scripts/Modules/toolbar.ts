import { App } from '@/App'
import { createAppMenu, IAppMenuElement } from '@/components/Toolbar/create'
import { IModuleConfig } from '../types'

export const ToolbarModule = ({ disposables }: IModuleConfig) => ({
	async createCategory(config: {
		displayName: string
		displayIcon?: string
		onClick?: () => void
		elements?: IAppMenuElement[]
	}) {
		const app = await App.getApp()
		const toolbar = createAppMenu(app.keyBindingManager, config)
		disposables.push(toolbar)
		return toolbar
	},
})
