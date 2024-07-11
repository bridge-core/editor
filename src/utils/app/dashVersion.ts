import packageConfig from '../../../package.json'

let version = packageConfig.dependencies['@bridge-editor/dash-compiler']

if (
	version.startsWith('^') ||
	version.startsWith('~') ||
	version.startsWith('>') ||
	version.startsWith('<')
)
	version = version.substring(1)
else if (version.startsWith('>=') || version.startsWith('<='))
	version = version.substring(2)

export const dashVersion = version
