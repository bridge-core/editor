import { IModuleConfig } from '../types'
import { version } from '@/appVersion.json'
import { App } from '@/App'

export const ContextEnv: { value: any } = { value: {} }

export const ENVModule = ({}: IModuleConfig) => ({
	APP_VERSION: version,
	getCurrentBP() {
		return `projects/${App.instance.selectedProject}/BP`
	},
	getCurrentRP() {
		return `projects/${App.instance.selectedProject}/RP`
	},
	getCurrentProject() {
		return `projects/${App.instance.selectedProject}`
	},
	getProjectPrefix() {
		return App.getApp().then(app => app.projectConfig.get('projectPrefix'))
	},
	getProjectTargetVersion() {
		return App.getApp().then(app =>
			app.projectConfig.get('projectTargetVersion')
		)
	},
	getProjectAuthor() {
		return App.getApp().then(app => app.projectConfig.get('projectAuthor'))
	},
	getContext() {
		// TODO
		// return ContextEnv.value
	},
})
