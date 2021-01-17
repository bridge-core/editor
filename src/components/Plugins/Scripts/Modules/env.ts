import { IModuleConfig } from '../types'
// import { CURRENT } from '../../../constants'
// import APP_VERSION from '../../../../../shared/app_version'
// import ProjectConfig from '../../../Project/Config'
import { selectedProject } from '@/components/Project/Loader'

export const ContextEnv: { value: any } = { value: {} }

export const ENVModule = ({}: IModuleConfig) => ({
	// TODO
	// APP_VERSION,
	getCurrentBP() {
		return `projects/${selectedProject}/BP`
	},
	getCurrentRP() {
		return `projects/${selectedProject}/RP`
	},
	getProjectPrefix() {
		// TODO
		// return ProjectConfig.getPrefixSync()
	},
	getProjectTargetVersion() {
		// TODO
		// return CURRENT.PROJECT_TARGET_VERSION
	},
	getContext() {
		// TODO
		// return ContextEnv.value
	},
})
