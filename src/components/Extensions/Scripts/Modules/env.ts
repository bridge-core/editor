import { IModuleConfig } from '../types'
import { version } from '@/appVersion.json'
import { selectedProject } from '@/components/Project/Loader'
import { App } from '@/App'

export const ContextEnv: { value: any } = { value: {} }

export const ENVModule = ({}: IModuleConfig) => ({
	APP_VERSION: version,
	getCurrentBP() {
		return `projects/${selectedProject}/BP`
	},
	getCurrentRP() {
		return `projects/${selectedProject}/RP`
	},
	getCurrentProject() {
		return `projects/${selectedProject}`
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
