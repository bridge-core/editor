import { run } from '/@/components/Extensions/Scripts/run'
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
import { ProjectConfig } from '../../Projects/Project/Config'
import { TCompilerPlugin } from './TCompilerPlugin'
import { TCompilerPluginFactory } from './TCompilerPluginFactory'
import { CustomCommandsPlugin } from './Plugins/CustomCommands/Plugin'
import { DataLoader } from '/@/components/Data/DataLoader'
import type { FileTypeLibrary } from '../../Data/FileType'

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
	dataLoader: DataLoader
	fileType: FileTypeLibrary
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
	dataLoader,
	fileType,
}: ILoadPLugins) {
	const plugins = new Map<string, TCompilerPluginFactory<any>>()
	const projectConfig = new ProjectConfig(localFs)
	await projectConfig.setup()

	const targetVersion =
		projectConfig.get().targetVersion ??
		(await getLatestFormatVersion(dataLoader))

	plugins.set('simpleRewrite', SimpleRewrite)
	plugins.set('typeScript', TypeScriptPlugin)
	plugins.set('customEntityComponents', CustomEntityComponentPlugin)
	plugins.set('customItemComponents', CustomItemComponentPlugin)
	plugins.set('customBlockComponents', CustomBlockComponentPlugin)
	plugins.set('entityIdentifierAlias', EntityIdentifierAlias)
	plugins.set('moLang', MoLangPlugin)
	plugins.set('customCommands', CustomCommandsPlugin)

	for (const [pluginId, pluginPath] of Object.entries(pluginPaths ?? {})) {
		let file: File
		try {
			file = await fileSystem.readFile(pluginPath)
		} catch (err) {
			continue
		}

		const module: { exports?: TCompilerPluginFactory } = {}
		await run({
			async: true,
			script: await file.text(),
			env: {
				require: undefined,
				module,
				JSON: {
					parse: json5.parse,
					stringify: JSON.stringify,
				},
			},
		})

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
				fileType,
				dataLoader,
				projectConfig,
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

async function getLatestFormatVersion(dataLoader: DataLoader) {
	await dataLoader.fired

	const formatVersions: string[] = await dataLoader.readJSON(
		'data/packages/minecraftBedrock/formatVersions.json'
	)

	return formatVersions[0]
}
