import { runAsync } from '/@/components/Extensions/Scripts/run'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ComMojangRewrite } from './Plugins/ComMojangRewrite'
import { Maybe } from '/@/types/Maybe'
import { TypeScriptPlugin } from './Plugins/TypeScript'
import json5 from 'json5'
import {
	CustomBlockComponentPlugin,
	CustomEntityComponentPlugin,
	CustomItemComponentPlugin,
} from './Plugins/CustomComponent/Plugin'
import { SimpleRewrite } from './Plugins/simpleRewrite'
import { EntityIdentifierAlias } from './Plugins/EntityIdentifier'
import { MoLangPlugin } from './Plugins/MoLang/Plugin'

export type TCompilerHook = keyof TCompilerPlugin
export type TCompilerPlugin = {
	/**
	 * Runs once before a build process starts
	 */
	buildStart(): Promise<void> | void
	/**
	 * Register files that should be loaded too
	 */
	include(): Maybe<string[]>

	/**
	 * Transform file path
	 * - E.g. adjust file path to point to build folder
	 * - Return null to omit file from build output
	 */
	transformPath(filePath: string | null): Maybe<string>

	/**
	 * Read the file at `filePath` and return its content
	 * - Return null/undefined to just copy the file over
	 */
	read(
		filePath: string,
		fileHandle?: FileSystemFileHandle
	): Promise<any> | any

	/**
	 * Load the fileContent and bring it into a usable form
	 */
	load(filePath: string, fileContent: any): Promise<any> | any

	/**
	 * Provide alternative lookups for a file
	 * - E.g. custom component names
	 */
	registerAliases(source: string, fileContent: any): Maybe<string[]>

	/**
	 * Register that a file depends on other files
	 */
	require(source: string, fileContent: any): Maybe<string[]>

	/**
	 * Transform a file's content
	 */
	transform(
		filePath: string,
		fileContent: any,
		dependencies?: Record<string, any>
	): Promise<any> | any

	/**
	 * Prepare data before it gets written to disk
	 */
	finalizeBuild(
		filePath: string,
		fileContent: any
	): Maybe<FileSystemWriteChunkType>

	/**
	 * Runs once after a build process ended
	 */
	buildEnd(): Promise<void> | void
}
export type TCompilerPluginFactory<T = any> = (context: {
	options: T
	fileSystem: FileSystem
	compileFiles: (
		files: string[],
		errorOnReadFailure?: boolean
	) => Promise<void>
	getAliases: (filePath: string) => string[]
}) => Partial<TCompilerPlugin>

export interface ILoadPLugins {
	fileSystem: FileSystem
	localFs: FileSystem
	pluginPaths: Record<string, string>
	pluginOpts: Record<string, any>
	compileFiles: (files: string[]) => Promise<void>
	getAliases: (filePath: string) => string[]
}

export async function loadPlugins({
	fileSystem,
	pluginPaths,
	localFs,
	pluginOpts,
	compileFiles,
	getAliases,
}: ILoadPLugins) {
	const plugins = new Map<string, TCompilerPluginFactory>()

	plugins.set('simpleRewrite', SimpleRewrite)
	plugins.set('comMojangRewrite', ComMojangRewrite)
	plugins.set('typeScript', TypeScriptPlugin)
	plugins.set('customEntityComponents', CustomEntityComponentPlugin)
	plugins.set('customItemComponents', CustomItemComponentPlugin)
	plugins.set('customBlockComponents', CustomBlockComponentPlugin)
	plugins.set('entityIdentifierAlias', EntityIdentifierAlias)
	plugins.set('moLang', MoLangPlugin)

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
				fileSystem,
				compileFiles,
				getAliases,
			})
		)
	}

	return loadedPlugins
}
