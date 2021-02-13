import { App } from '@/App'
import { TProjectConfigKey } from '@/components/Projects/ProjectConfig'
import { Selection } from './Selection'

export class ProjectSelection extends Selection<Promise<string> | string> {
	get value() {
		return App.getApp().then(app =>
			app.projectConfig.get(<TProjectConfigKey>this.config.key)
		)
	}
	set value(val) {
		App.getApp().then(app =>
			app.projectConfig.set(<TProjectConfigKey>this.config.key, val)
		)
	}
}
