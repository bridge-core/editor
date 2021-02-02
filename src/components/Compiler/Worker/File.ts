import { FileType } from '@/components/Data/FileType'
import { IBuildConfigPlugins } from './Main'
import { TCompilerHook, TCompilerPlugin } from './Plugins'

export class CompilerFile<T> {
	protected fileType: string

	constructor(
		protected filePath: string,
		protected fileHandle: FileSystemFileHandle
	) {
		this.fileType = FileType.getId(filePath)
	}

	async runHook(
		pluginDefs: IBuildConfigPlugins,
		plugins: Map<string, { exports?: TCompilerPlugin }>,
		hook: TCompilerHook
	) {
		await this.runHookFrom('*', pluginDefs, plugins, hook)
		await this.runHookFrom(this.fileType, pluginDefs, plugins, hook)
	}

	protected async runHookFrom(
		fromPlugin: string,
		pluginDefs: IBuildConfigPlugins,
		plugins: Map<string, { exports?: TCompilerPlugin }>,
		hook: TCompilerHook
	) {
		for (let plugin of pluginDefs[fromPlugin] ?? []) {
			let pluginOpts = {}
			if (Array.isArray(plugin)) [plugin, pluginOpts] = plugin

			let pluginObj = plugins.get(plugin)
			if (!pluginObj && fromPlugin !== '*')
				pluginObj = plugins.get('#default')

			await pluginObj?.exports?.[hook]?.(this, pluginOpts)
		}
	}
}
