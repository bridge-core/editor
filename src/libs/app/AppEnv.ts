import packageConfig from '../../../package.json'
import { isNightly as isNightlyBuild } from '../../../vite.config'

export const appVersion = packageConfig.version

export const baseUrl = import.meta.env.BASE_URL

let dashVersionTemp = packageConfig.dependencies['@bridge-editor/dash-compiler']

if (dashVersionTemp.startsWith('^') || dashVersionTemp.startsWith('~') || dashVersionTemp.startsWith('>') || dashVersionTemp.startsWith('<'))
	dashVersionTemp = dashVersionTemp.substring(1)
else if (dashVersionTemp.startsWith('>=') || dashVersionTemp.startsWith('<=')) dashVersionTemp = dashVersionTemp.substring(2)

export const dashVersion = dashVersionTemp

export const isNightly = isNightlyBuild
