import { App } from '/@/App'
import { IModuleConfig } from '../types'
import { TColorName } from '../../Themes/ThemeManager'

export const ThemeModule = async ({ disposables }: IModuleConfig) => {
	const app = await App.getApp()
	const themeManager = app.themeManager

	return {
		onChange: (func: (mode: 'dark' | 'light') => void) => {
			const disposable = themeManager.on(func)
			disposables.push(disposable)
			return disposable
		},
		getCurrentMode() {
			return app.themeManager.getCurrentMode()
		},
		getColor(name: TColorName) {
			return themeManager.getColor(name)
		},
		getHighlighterInfo(name: string) {
			return themeManager.getHighlighterInfo(name)
		},
	}
}
