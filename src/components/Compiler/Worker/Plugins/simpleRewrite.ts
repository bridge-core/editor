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
		WT: 'minecraftWorlds',
	}

	// Rewrite paths so files land in the correct comMojangFolder if comMojang folder is set
	const pathPrefix = (pack: string) =>
		hasComMojangDirectory && options.mode === 'dev'
			? `${folders[pack]}`
			: `builds/${options.buildName}`
	const pathPrefixWithPack = (pack: string) =>
		`${pathPrefix(pack)}/${options.packName} ${pack}`

	return {
		async buildStart() {
			if (options.mode === 'build' || options.restartDevServer) {
				if (hasComMojangDirectory) {
					for (const pack in folders) {
						await outputFileSystem
							.unlink(pathPrefixWithPack(pack))
							.catch(() => {})

						await outputFileSystem.mkdir(pathPrefixWithPack(pack), {
							recursive: true,
						})
					}
				} else {
					//Using "BP" is fine here because the path doesn't change based on the pack without a com.mojang folder
					await outputFileSystem
						.unlink(pathPrefix('BP'))
						.catch(() => {})
				}
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

			if (['BP', 'RP', 'SP', 'WT'].includes(pack))
				return `${pathPrefixWithPack(pack)}/${pathParts.join('/')}`
		},
	}
}
