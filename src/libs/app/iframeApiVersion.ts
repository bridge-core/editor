import packageConfig from '../../../package.json'

let version = packageConfig.dependencies['bridge-iframe-api']

if (
	version.startsWith('^') ||
	version.startsWith('~') ||
	version.startsWith('>') ||
	version.startsWith('<')
)
	version = version.substring(1)
else if (version.startsWith('>=') || version.startsWith('<='))
	version = version.substring(2)

export const iframeApiVersion = version
