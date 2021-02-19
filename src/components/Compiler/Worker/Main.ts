import * as Comlink from 'comlink'
import { TaskService } from '/@/components/TaskManager/WorkerTask'
import { hooks, loadPlugins, TCompilerHook, TCompilerPlugin } from './Plugins'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { FileType } from '/@/components/Data/FileType'
import { CompilerFile } from './File'

export interface ICompilerOptions {
	projectDirectory: FileSystemDirectoryHandle
	baseDirectory: FileSystemDirectoryHandle
	config: string
	mode: 'dev' | 'build'
	plugins: Record<string, string>
}
export interface IBuildConfig {
	mode: 'dev' | 'build'

	createFiles: string[]
	plugins: IBuildConfigPlugins
}
export interface IBuildConfigPlugins {
	'*'?: TPluginDef[]
	'#default'?: TPluginDef[]
	[fileType: string]: TPluginDef[] | undefined
}
export type TPluginDef = string | [string, any]

export class CompilerService extends TaskService<void, string[]> {
	protected buildConfig!: IBuildConfig
	protected plugins!: Map<string, TCompilerPlugin>
	protected files = new Map<string, CompilerFile>()

	constructor(protected readonly options: ICompilerOptions) {
		super('compiler', options.projectDirectory)
	}

	getOptions() {
		return this.options
	}

	async onStart(updatedFiles: string[]) {
		const globalFs = new FileSystem(this.options.baseDirectory)
		await FileType.setup(globalFs)

		try {
			this.buildConfig = await this.fileSystem.readJSON(
				`bridge/compiler/${this.options.config}`
			)
		} catch {}

		this.plugins = await loadPlugins(globalFs, this.options.plugins)

		for (const updatedFile of updatedFiles)
			this.files.set(
				updatedFile,
				new CompilerFile(
					this,
					this.fileSystem,
					updatedFile,
					await this.fileSystem.getFileHandle(updatedFile)
				)
			)

		this.progress.setTotal(hooks.length * this.files.size)
		for (const hook of hooks) {
			console.time(`[COMPILER] Running hook "${hook}"`)
			await this.runHook(this.files, hook)
			console.timeEnd(`[COMPILER] Running hook "${hook}"`)
		}
	}

	async updatePlugins(plugins: Record<string, string>) {
		const globalFs = new FileSystem(this.options.baseDirectory)
		this.plugins = await loadPlugins(globalFs, plugins)
	}

	protected async runHook(
		files: Map<string, CompilerFile>,
		hook: TCompilerHook
	) {
		for (const [_, file] of files) {
			await file.runHook(this.buildConfig.plugins, this.plugins, hook)
			this.progress.addToCurrent()
		}
	}

	async updateFile(filePath: string) {
		let file = this.files.get(filePath)
		if (!file) {
			file = new CompilerFile(
				this,
				this.fileSystem,
				filePath,
				await this.fileSystem.getFileHandle(filePath)
			)
			this.files.set(filePath, file)
		}

		for (const hook of hooks) {
			await file.runHook(this.buildConfig.plugins, this.plugins, hook)
		}
	}
	updateMode(mode: 'dev' | 'build') {
		this.options.mode = mode
	}
}

Comlink.expose(CompilerService, self)
