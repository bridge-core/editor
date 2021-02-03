import { EventManager } from '@/appCycle/EventSystem'
import { FileType } from '@/components/Data/FileType'
import { FileSystem } from '@/components/FileSystem/Main'
import { IBuildConfigPlugins } from './Main'
import { hooks, TCompilerHook, TCompilerPlugin } from './Plugins'

export class CompilerFile {
	protected fileType: string
	protected files: CompilerFile[] = []
	protected hooks = new EventManager<void>(hooks)
	protected _originalFilePath: string
	protected data?: any

	constructor(
		protected fs: FileSystem,
		protected filePath: string,
		protected fileHandle: FileSystemFileHandle
	) {
		this.fileType = filePath ? FileType.getId(filePath) : 'unknown'
		this._originalFilePath = filePath
	}

	async create(filePath: string) {
		const file = new CompilerFile(
			this.fs,
			filePath,
			await this.fs.getFileHandle(filePath, true)
		)
		this.files.push(file)
		return file
	}

	async runHook(
		pluginDefs: IBuildConfigPlugins,
		plugins: Map<string, TCompilerPlugin>,
		hook: TCompilerHook
	) {
		// Before calling the cleanup hook, save the file
		if (hook === 'cleanup') await this.save()

		this.hooks.dispatch(hook)

		await this.runHookFrom('*', pluginDefs, plugins, hook)
		await this.runHookFrom(this.fileType, pluginDefs, plugins, hook)

		for (const file of this.files)
			await file.runHook(pluginDefs, plugins, hook)
	}

	protected async runHookFrom(
		fromPluginEntry: string,
		pluginDefs: IBuildConfigPlugins,
		plugins: Map<string, TCompilerPlugin>,
		hook: TCompilerHook
	): Promise<any> {
		for (let plugin of pluginDefs[fromPluginEntry] ?? []) {
			let pluginOpts = {}
			if (Array.isArray(plugin)) [plugin, pluginOpts] = plugin

			let pluginObj = plugins.get(plugin)
			if (!pluginObj && fromPluginEntry !== '*')
				pluginObj = plugins.get('#default')

			await pluginObj?.[hook]?.(this, pluginOpts)
		}
	}

	save() {
		// Plugin wants to omit file from output
		if (this.data === null) return

		if (this.data) return this.fs.writeFile(this.filePath, this.data)
		if (this._originalFilePath !== this.filePath)
			return this.fs.copyFile(this._originalFilePath, this.filePath)
	}
}
