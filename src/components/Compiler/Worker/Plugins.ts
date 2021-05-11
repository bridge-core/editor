import { runAsync } from '/@/components/Extensions/Scripts/run'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
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
	outputFs: FileSystem
	hasComMojangDirectory: boolean
	pluginPaths: Record<string, string>
	pluginOpts: Record<string, any>
	getAliases: (filePath: string) => string[]
	compileFiles: (files: string[]) => Promise<void>
}

export async function loadPlugins({
	fileSystem,
	pluginPaths,
	localFs,
	outputFs,
	pluginOpts,
	hasComMojangDirectory,
	compileFiles,
	getAliases,
}: ILoadPLugins) {
	const plugins = new Map<string, TCompilerPluginFactory<any>>()
	const projectConfig = new ProjectConfig(localFs)
	await projectConfig.setup()

	const targetVersion =
		projectConfig.get().targetVersion ??
		(await getLatestFormatVersion(fileSystem))

	plugins.set('simpleRewrite', SimpleRewrite)
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
				outputFileSystem: outputFs,
				hasComMojangDirectory,
				getAliases,
				targetVersion,
				compileFiles,
			})
		)
	}

	return loadedPlugins
}

async function getLatestFormatVersion(fileSystem: FileSystem) {
	const formatVersions: string[] = await fileSystem.readJSON(
		'data/packages/minecraftBedrock/formatVersions.json'
	)

	return formatVersions[0]
}
