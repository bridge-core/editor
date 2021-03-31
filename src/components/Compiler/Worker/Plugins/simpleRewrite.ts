import { TCompilerPluginFactory } from '../TCompilerPluginFactory'

export const SimpleRewrite: TCompilerPluginFactory = ({
	options,
	outputFileSystem,
	hasComMojangDirectory,
}) => {
	if (!options.buildName)
		options.buildName = options.mode === 'dev' ? 'dev' : 'dist'
	if (!options.packName) options.packName = 'Bridge'
	if (!(options.rewriteToComMojang ?? true)) hasComMojangDirectory = false

	const folders: Record<string, string> = {
		BP: 'development_behavior_packs',
		RP: 'development_resource_packs',
		SP: 'skin_packs',
	}

	return {
		async buildStart() {
			if (options.mode === 'build') {
				await outputFileSystem
					.unlink(`builds/${options.buildName}`)
					.catch(() => {})
			}
		},
		transformPath(filePath) {
			if (!filePath) return
			// Don't include gametests in production builds
			if (
				filePath.includes('BP/scripts/gametests/') &&
				options.mode === 'build'
			)
				return

			const pathParts = filePath.split('/')
			const pack = <string>pathParts.shift()

			// Rewrite paths so files land in the correct comMojangFolder
			if (hasComMojangDirectory && options.mode === 'dev') {
				if (folders[pack])
					return `${folders[pack]}/${
						options.packName
					} ${pack}/${pathParts.join('/')}`
			}

			if (['BP', 'RP', 'SP'].includes(pack))
				return `builds/${options.buildName}/${
					options.packName
				} ${pack}/${pathParts.join('/')}`
		},
	}
}
