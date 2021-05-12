import { App } from '/@/App'
import { Selection } from './Selection'

export class BridgeConfigSelection extends Selection<Promise<string> | string> {
	get value() {
		return App.getApp().then(
			(app) => (<any>app.projectConfig.get().bridge)[this.config.key]
		)
	}
	set value(val) {
		App.getApp().then(async (app) => {
			;(<any>app.projectConfig.get().bridge)[this.config.key] = val
			await app.projectConfig.save()
		})
	}
}
