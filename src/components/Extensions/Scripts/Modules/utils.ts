import { IModuleConfig } from '../types'

export const UtilsModule = ({}: IModuleConfig) => ({
	openExternal: (url: string) => window.open(url, '_blank'),
})
