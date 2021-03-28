import { runAsync } from '/@/components/Extensions/Scripts/run'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ComMojangRewrite } from './Plugins/ComMojangRewrite'
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
import { ProjectConfig } from '../../Projects/ProjectConfig'
import { TCompilerPlugin } from './TCompilerPlugin'
import { TCompilerPluginFactory } from './TCompilerPluginFactory'

export type TCompilerHook = keyof TCompilerPlugin
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
	const projectConfig = new ProjectConfig(localFs)
	const targetVersion = await projectConfig.get('targetVersion')

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
				targetVersion,
			})
		)
	}

	return loadedPlugins
}
