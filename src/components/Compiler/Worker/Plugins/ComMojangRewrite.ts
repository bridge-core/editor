import { TCompilerPlugin } from '../Plugins'

const folders: any = {
	BP: 'development_behavior_packs',
	RP: 'development_resource_packs',
	SP: 'development_skin_packs',
}
let clearedDir = false

export const ComMojangRewrite: TCompilerPlugin = {
	async transformPath(file, opts) {
		if (!opts.buildName)
			opts.buildName = opts.mode === 'dev' ? 'dev' : 'dist'

		if (opts.mode === 'build' && !clearedDir) {
			clearedDir = true
			await file.rmdir(`builds/${opts.buildName}`)
		}

		const pathParts = file.filePath.split('/')
		const pack = <string>pathParts.shift()

		if (!opts.packName) opts.packName = 'bridge ' + pack

		if (folders[pack])
			file.filePath = `builds/${opts.buildName}/${folders[pack]}/${
				opts.packName
			}/${pathParts.join('/')}`
	},
}
