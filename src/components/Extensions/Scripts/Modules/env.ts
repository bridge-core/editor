import { IModuleConfig } from '../types'
import { version } from '/@/utils/app/version'
import { App } from '/@/App'
import { isNightly } from '/@/utils/app/isNightly'
import { TPackTypeId } from 'mc-project-core'

export const ContextEnv: { value: any } = { value: {} }

export const ENVModule = ({}: IModuleConfig) => ({
	APP_VERSION: version,
	isNightlyBuild: isNightly,

	getCurrentBP() {
		return App.getApp().then((app) =>
			app.projectConfig.resolvePackPath('behaviorPack')
		)
	},
	getCurrentRP() {
		return App.getApp().then((app) =>
			app.projectConfig.resolvePackPath('resourcePack')
		)
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
	getProjectAuthors() {
		return App.getApp().then((app) => app.projectConfig.get().authors)
	},
	resolvePackPath(packId?: TPackTypeId, filePath?: string) {
		return App.getApp().then((app) =>
			app.projectConfig.resolvePackPath(packId, filePath)
		)
	},

	getContext() {
		console.warn('This API is deprecated!')
		return {}
	},
})
