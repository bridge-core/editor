import { GenericEvent } from './GenericEvent'
import { App } from '/@/App'

export class ThemeChangeEvent extends GenericEvent {
	async setup() {
		const app = await App.getApp()

		this.disposables.push(
			app.themeManager.on(() => {
				this.api.trigger(
					'themeManager.themeChange',
					app.themeManager.getCurrentTheme()
				)
			})
		)

		this.api.trigger(
			'themeManager.themeChange',
			app.themeManager.getCurrentTheme()
		)
	}
}
