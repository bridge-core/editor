import packageConfig from '../../../package.json'

export const appVersion = packageConfig.version

export const baseUrl = import.meta.env.BASE_URL

let dashVersionTemp = packageConfig.dependencies['dash-compiler']

if (
	dashVersionTemp.startsWith('^') ||
	dashVersionTemp.startsWith('~') ||
	dashVersionTemp.startsWith('>') ||
	dashVersionTemp.startsWith('<')
)
	dashVersionTemp = dashVersionTemp.substring(1)
else if (dashVersionTemp.startsWith('>=') || dashVersionTemp.startsWith('<='))
	dashVersionTemp = dashVersionTemp.substring(2)

export const dashVersion = dashVersionTemp
