import '/@/components/FileSystem/Virtual/Comlink'
import { expose } from 'comlink'
import { TaskService } from '/@/components/TaskManager/WorkerTask'
import { loadPlugins } from './Plugins'
import { TCompilerPlugin } from './TCompilerPlugin'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { FileTypeLibrary, IFileType } from '/@/components/Data/FileType'
import { Compiler } from './Compiler'
import { DataLoader } from '/@/components/Data/DataLoader'
import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { ProjectConfig } from '../../Projects/Project/Config'

export interface ICompilerOptions {
	config: string
	mode: 'dev' | 'build'
	isDevServerRestart: boolean
	isFileRequest: boolean
	plugins: Record<string, string>
	pluginFileTypes: IFileType[]
	allFiles: string[]
}
export interface IBuildConfig {
	plugins: TPluginDef[]
}
export type TPluginDef = string | [string, any]

export class CompilerService extends TaskService<void, [string[], string[]]> {
	public fileSystem: FileSystem
	protected buildConfig: IBuildConfig = { plugins: [] }
	protected plugins!: Map<string, Partial<TCompilerPlugin>>
	protected _outputFileSystem?: FileSystem
	protected dataLoader = new DataLoader()
	protected compiler: Compiler
	public fileType: FileTypeLibrary
	public config: ProjectConfig

	constructor(
		projectDirectory: AnyDirectoryHandle,
		protected baseDirectory: AnyDirectoryHandle,
		comMojangDirectory: AnyDirectoryHandle | undefined,
		protected readonly options: ICompilerOptions
	) {
		super()

		this.fileSystem = new FileSystem(projectDirectory)

		this.compiler = new Compiler(this)
		this.config = new ProjectConfig(this.fileSystem)
		this.fileType = new FileTypeLibrary(this.config)
		this.fileType.setPluginFileTypes(options.pluginFileTypes)

		if (comMojangDirectory)
			this._outputFileSystem = new FileSystem(comMojangDirectory)
	}

	getOptions() {
		return {
			baseDirectory: this.baseDirectory,
			projectDirectory: this.fileSystem.baseDirectory,
			comMojangDirectory: this._outputFileSystem?.baseDirectory,
			...this.options,
		}
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
		await this.fileType.setup(this.dataLoader)

		try {
			if (this.options.config === 'default') {
				// Try loading compiler config from the project config file
				this.buildConfig = await this.fileSystem
					.readJSON('config.json')
					.then((config) => config.compiler)

				/**
				 * @depracted Support legacy projects with a default.json file
				 * Remove with next major release
				 */
				if (this.buildConfig === undefined) {
					this.buildConfig = await this.fileSystem.readJSON(
						`.bridge/compiler/${this.options.config}.json`
					)
				}
			} else {
				// Load all other compiler config files
				this.buildConfig = await this.fileSystem.readJSON(
					`.bridge/compiler/${this.options.config}`
				)
			}
		} catch (err) {
			console.error(err)
			return
		}

		await this.loadPlugins(this.options.plugins)

		if (updatedFiles.length > 0)
			await this.compiler.runWithFiles(updatedFiles)

		if (deletedFiles.length > 0) {
			await Promise.all(
				deletedFiles.map((deletedFile) =>
					this.compiler.unlink(deletedFile, undefined, false)
				)
			)
			await this.compiler.processFileMap()
		}
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
		const globalFs = new FileSystem(this.getOptions().baseDirectory)

		this.plugins = await loadPlugins({
			fileSystem: globalFs,
			fileType: this.fileType,
			pluginPaths: plugins,
			localFs: this.fileSystem,
			outputFs: this.outputFileSystem,
			pluginOpts: this.pluginOpts,
			hasComMojangDirectory:
				this.getOptions().comMojangDirectory !== undefined,
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
		this.fileType.setPluginFileTypes(pluginFileTypes)
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
