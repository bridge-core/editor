import { TCompilerPluginFactory } from '../Plugins'

export const ComMojangRewrite: TCompilerPluginFactory = ({
	options,
	fileSystem,
}) => {
	if (!options.buildName)
		options.buildName = options.mode === 'dev' ? 'dev' : 'dist'
	if (!options.packName) options.packName = 'Bridge'

	const folders: Record<string, string> = {
		BP: 'development_behavior_packs',
		RP: 'development_resource_packs',
		SP: 'skin_packs',
	}

	return {
		async buildStart() {
			if (options.mode === 'build') {
				await fileSystem
					.unlink(`builds/${options.buildName}`)
					.catch(() => {})
			}
		},
		transformPath(filePath) {
			const pathParts = filePath.split('/')
			const pack = <string>pathParts.shift()

			if (folders[pack])
				return `builds/${options.buildName}/${folders[pack]}/${
					options.packName
				} ${pack}/${pathParts.join('/')}`
		},
	}
}
