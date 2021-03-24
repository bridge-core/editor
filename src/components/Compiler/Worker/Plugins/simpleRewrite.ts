import { TCompilerPluginFactory } from '../Plugins'

export const SimpleRewrite: TCompilerPluginFactory = ({
	options,
	fileSystem,
}) => {
	if (!options.buildName)
		options.buildName = options.mode === 'dev' ? 'dev' : 'dist'
	if (!options.packName) options.packName = 'Bridge'

	return {
		async buildStart() {
			if (options.mode === 'build') {
				await fileSystem
					.unlink(`builds/${options.buildName}`)
					.catch(() => {})
			}
		},
		transformPath(filePath) {
			if (!filePath) return
			// Don't include gametests in production builds
			if (
				filePath.includes('BP/scripts/gametests') &&
				options.mode === 'build'
			)
				return

			const pathParts = filePath.split('/')
			const pack = <string>pathParts.shift()

			if (['BP', 'RP', 'SP'].includes(pack))
				return `builds/${options.buildName}/${
					options.packName
				} ${pack}/${pathParts.join('/')}`
		},
	}
}
