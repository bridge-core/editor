import { expose } from 'comlink'
import { TaskService } from '/@/components/TaskManager/WorkerTask'
import { loadPlugins } from './Plugins'
import { TCompilerPlugin } from './TCompilerPlugin'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { FileType, IFileType } from '/@/components/Data/FileType'
import { Compiler } from './Compiler'
import { DataLoader } from '../../Data/DataLoader'
import { AnyDirectoryHandle } from '../../FileSystem/Types'

export interface ICompilerOptions {
	projectDirectory: AnyDirectoryHandle
	baseDirectory: AnyDirectoryHandle
	comMojangDirectory?: AnyDirectoryHandle
	config: string
	mode: 'dev' | 'build'
	isDevServerRestart: boolean
	isFileRequest: boolean
	plugins: Record<string, string>
	pluginFileTypes: IFileType[]
	allFiles: string[]
}
export interface IBuildConfig {
	mode: 'dev' | 'build'

	createFiles: string[]
	plugins: TPluginDef[]
}
export type TPluginDef = string | [string, any]

const compilers = new WeakMap<CompilerService, Compiler>()
export class CompilerService extends TaskService<void, [string[], string[]]> {
	public fileSystem: FileSystem
	protected buildConfig!: IBuildConfig
	protected plugins!: Map<string, Partial<TCompilerPlugin>>
	protected _outputFileSystem?: FileSystem
	protected dataLoader = new DataLoader()

	// This is necessary so the compiler object doesn't get included in the proxy
	get compiler() {
		return compilers.get(this)!
	}
	set compiler(val: Compiler) {
		compilers.set(this, val)
	}

	constructor(protected readonly options: ICompilerOptions) {
		super()
		this.fileSystem = new FileSystem(options.projectDirectory)
		FileType.setPluginFileTypes(options.pluginFileTypes)
		this.compiler = new Compiler(this)

		if (this.options.comMojangDirectory)
			this._outputFileSystem = new FileSystem(
				this.options.comMojangDirectory
			)
	}

	getOptions() {
		return this.options
	}
	getPlugins() {
		return this.plugins
	}
	get pluginOpts() {
		const extraOpts = {
			mode: this.options.mode,
			restartDevServer: this.options.isDevServerRestart,
			isFileRequest: this.options.isFileRequest,
		}
		return Object.fromEntries(
			this.buildConfig.plugins.map((def) =>
				Array.isArray(def)
					? [
							def[0],
							{
								...def[1],
								...extraOpts,
							},
					  ]
					: [def, extraOpts]
			)
		)
	}
	get outputFileSystem() {
		if (this.options.mode === 'build') return this.fileSystem

		return this._outputFileSystem ?? this.fileSystem
	}

	async onStart([updatedFiles, deletedFiles]: [string[], string[]]) {
		const globalFs = new FileSystem(this.options.baseDirectory)
		await FileType.setup(this.dataLoader)

		try {
			this.buildConfig = await this.fileSystem.readJSON(
				`.bridge/compiler/${this.options.config}`
			)
		} catch {
			return
		}

		await this.loadPlugins(this.options.plugins)

		await this.compiler.runWithFiles(updatedFiles)

		await Promise.all(
			deletedFiles.map((deletedFile) =>
				this.compiler.unlink(deletedFile, undefined, false)
			)
		)
		await this.compiler.processFileMap()
	}

	async updateFiles(filePaths: string[]) {
		await this.compiler.runWithFiles(filePaths)
	}
	async unlink(path: string) {
		await this.compiler.unlink(path)
		await this.compiler.processFileMap()
	}
	getCompilerOutputPath(path: string) {
		return this.compiler.getCompilerOutputPath(path)
	}
	compileWithFile(filePath: string, file: Uint8Array) {
		return this.compiler.compileWithFile(
			filePath,
			new File([file], filePath.split('/').pop()!)
		)
	}

	async loadPlugins(plugins: Record<string, string>) {
		const globalFs = new FileSystem(this.options.baseDirectory)

		this.plugins = await loadPlugins({
			fileSystem: globalFs,
			pluginPaths: plugins,
			localFs: this.fileSystem,
			outputFs: this.outputFileSystem,
			pluginOpts: this.pluginOpts,
			hasComMojangDirectory:
				this.options.comMojangDirectory !== undefined,
			getAliases: (filePath: string) =>
				this.compiler.getAliases(filePath),
			compileFiles: (files: string[]) =>
				this.compiler.compileFiles(files),
			dataLoader: this.dataLoader,
		})
	}
	async updatePlugins(
		plugins: Record<string, string>,
		pluginFileTypes: IFileType[]
	) {
		await this.loadPlugins(plugins)
		FileType.setPluginFileTypes(pluginFileTypes)
	}
	updateMode(
		mode: 'dev' | 'build',
		isFileRequest: boolean,
		isDevServerRestart: boolean
	) {
		this.options.mode = mode
		this.options.isDevServerRestart = isDevServerRestart
		this.options.isFileRequest = isFileRequest
	}
}

expose(CompilerService, self)
