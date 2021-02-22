import { App } from '/@/App'
import { TProjectConfigKey } from '/@/components/Projects/ProjectConfig'
import { Toggle } from './Toggle'

export class ProjectToggle extends Toggle<Promise<boolean>> {
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
