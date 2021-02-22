import { EventSystem } from '/@/components/Common/Event/EventSystem'
import { FileType } from '/@/components/Data/FileType'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { dirname } from '/@/utils/path'
import { CompilerService, TPluginDef } from './Main'
import { hooks, TCompilerHook, TCompilerPlugin } from './Plugins'

export class CompilerFile {
	protected fileType: string
	protected files: CompilerFile[] = []
	protected hooks = new EventSystem<void>(hooks)
	protected _originalFilePath: string
	protected data?: any

	constructor(
		protected parent: CompilerService,
		protected fs: FileSystem,
		public filePath: string,
		protected fileHandle: FileSystemFileHandle
	) {
		this.fileType = filePath ? FileType.getId(filePath) : 'unknown'
		this._originalFilePath = filePath
	}

	async create(filePath: string) {
		const file = new CompilerFile(
			this.parent,
			this.fs,
			filePath,
			await this.fs.getFileHandle(filePath, true)
		)
		this.files.push(file)
		return file
	}

	async runHook(
		runPlugins: TPluginDef[],
		plugins: Map<string, TCompilerPlugin>,
		hook: TCompilerHook
	) {
		this.hooks.dispatch(hook)

		for (let plugin of runPlugins) {
			let pluginOpts: any = {}
			if (Array.isArray(plugin)) [plugin, pluginOpts] = plugin
			pluginOpts.mode = this.parent.getOptions().mode

			let pluginObj = plugins.get(plugin)
			await pluginObj?.[hook]?.(this, pluginOpts)
		}

		// After calling the finalizeBuild hook, save the files
		if (hook === 'finalizeBuild') await this.save()
		// After calling the cleanup hook, cleanup the file obj
		if (hook === 'finalizeBuild') this.cleanup()
	}

	async save() {
		// Plugin wants to omit file from output or file location didn't change
		if (this.data === null || this._originalFilePath === this.filePath)
			return

		if (this.data) {
			await this.fs
				.mkdir(dirname(this.filePath), { recursive: true })
				.then(() => this.fs.writeFile(this.filePath, this.data))
		} else {
			const copiedFileHandle = await this.fs.getFileHandle(
				this.filePath,
				true
			)

			const writable = await copiedFileHandle.createWritable()
			await writable.write(await this.fileHandle.getFile())
			await writable.close()
		}
	}
	cleanup() {
		this.data = undefined
		this.filePath = this._originalFilePath
	}

	rmdir(path: string) {
		return this.fs.unlink(path)
	}
}
