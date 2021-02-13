import { runAsync } from '@/components/Extensions/Scripts/run'
import { FileSystem } from '@/components/FileSystem/FileSystem'
import { CompilerFile } from './File'
import { ComMojangRewrite } from './Plugins/ComMojangRewrite'

export const hooks = <const>[
	'createFiles',
	'collect',
	'beforeTransform',
	'transform',
	'afterTransform',
	'transformPath',
	'finalizeBuild',
	'cleanup',
]

export type TCompilerHook = typeof hooks[number]

export type TCompilerPlugin = {
	[hook in TCompilerHook]?: (file: CompilerFile, opts: any) => Promise<void>
}

export async function loadPlugins(
	fileSystem: FileSystem,
	pluginPaths: Record<string, string>
) {
	const plugins = new Map<string, TCompilerPlugin>()

	plugins.set('comMojangRewrite', ComMojangRewrite)

	for (const [pluginId, pluginPath] of Object.entries(pluginPaths ?? {})) {
		let file: File
		try {
			file = await fileSystem.readFile(pluginPath)
		} catch (err) {
			continue
		}

		const module: { exports?: TCompilerPlugin } = {}
		await runAsync(
			await file.text(),
			[undefined, module],
			['require', 'module']
		)
		plugins.set(pluginId, module?.exports ?? {})
	}

	return plugins
}
