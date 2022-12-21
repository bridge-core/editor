import { IModuleConfig } from '../types'
import { App } from '/@/App'

export const UtilsModule = ({}: IModuleConfig) => ({
	openExternal: (url: string) => App.openUrl(url, undefined, true),
})
