import { IModuleConfig } from '../types'
import { version } from '/@/utils/app/version'
import { App } from '/@/App'

export const ContextEnv: { value: any } = { value: {} }

export const ENVModule = ({}: IModuleConfig) => ({
	APP_VERSION: version,
	getCurrentBP() {
		return `${App.instance.project.projectPath}/BP`
	},
	getCurrentRP() {
		return `${App.instance.project.projectPath}/RP`
	},
	getCurrentProject() {
		return App.instance.project.projectPath
	},
	getProjectPrefix() {
		return App.getApp().then((app) => app.projectConfig.get().namespace)
	},
	getProjectTargetVersion() {
		return App.getApp().then((app) => app.projectConfig.get().targetVersion)
	},
	getProjectAuthor() {
		return App.getApp().then((app) => app.projectConfig.get().author)
	},
	getContext() {
		console.warn('This API is deprecated!')
		return {}
	},
})
