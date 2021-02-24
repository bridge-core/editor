import { runAsync } from '/@/components/Extensions/Scripts/run'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ComMojangRewrite } from './Plugins/ComMojangRewrite'
import { Maybe } from '/@/types/Maybe'
import { TypeScriptPlugin } from './Plugins/TypeScript'
import json5 from 'json5'

export type TCompilerHook = keyof TCompilerPlugin
export type TCompilerPlugin = {
	/**
	 * Runs once before a build process starts
	 */
	buildStart(): Promise<void>

	/**
	 * Given a source id, return the filePath it belongs to
	 * - E.g. resolve custom component names
	 */
	resolveId(source: string, importer?: string): Maybe<string>
	/**
	 * Runs after all ids have been resolved
	 */
	afterResolveId(filePath: string): Promise<void> | void

	/**
	 * Transform file path
	 * - E.g. adjust file path to point to build folder
	 */
	transformPath(filePath: string): Maybe<string>

	/**
	 * Load the file at `filePath` and return its content
	 * - Return null/undefined to just copy the file over
	 */
	load(filePath: string, fileHandle: FileSystemFileHandle): Promise<any> | any

	/**
	 * Transform a file's content
	 */
	transform(filePath: string, fileContent: any): Promise<any> | any

	/**
	 * Prepare data before it gets written to disk
	 * - Return null/undefined to omit file from output
	 */
	finalizeBuild(
		filePath: string,
		fileContent: any
	): Maybe<FileSystemWriteChunkType>

	/**
	 * Runs once after a build process ended
	 */
	buildEnd(): Promise<void>
}
export type TCompilerPluginFactory = (context: {
	options: any
	fileSystem: FileSystem
	resolve: (id: string) => Promise<any>
}) => Partial<TCompilerPlugin>

export interface ILoadPLugins {
	fileSystem: FileSystem
	localFs: FileSystem
	pluginPaths: Record<string, string>
	pluginOpts: Record<string, any>
	resolve: (id: string) => Promise<any>
}

export async function loadPlugins({
	fileSystem,
	pluginPaths,
	localFs,
	pluginOpts,
	resolve,
}: ILoadPLugins) {
	const plugins = new Map<string, TCompilerPluginFactory>()

	plugins.set('comMojangRewrite', ComMojangRewrite)
	plugins.set('typeScript', TypeScriptPlugin)

	for (const [pluginId, pluginPath] of Object.entries(pluginPaths ?? {})) {
		let file: File
		try {
			file = await fileSystem.readFile(pluginPath)
		} catch (err) {
			continue
		}

		const module: { exports?: TCompilerPluginFactory } = {}
		await runAsync(
			await file.text(),
			[
				undefined,
				module,
				{ parse: json5.parse, stringify: JSON.stringify },
			],
			['require', 'module', 'JSON']
		)

		if (typeof module.exports === 'function')
			plugins.set(pluginId, module.exports)
		else
			console.error(
				`Failed to load plugin "${pluginId}": No export of type "function" defined`
			)
	}

	const loadedPlugins = new Map<string, Partial<TCompilerPlugin>>()
	for (const pluginId in pluginOpts) {
		const plugin = plugins.get(pluginId)
		if (!plugin)
			throw new Error(
				`Failed to resolve plugin "${pluginId}": Plugin not found`
			)

		loadedPlugins.set(
			pluginId,
			plugin({
				options: pluginOpts[pluginId],
				fileSystem: localFs,
				resolve,
			})
		)
	}

	return loadedPlugins
}
