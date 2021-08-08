import { App } from '/@/App'
import { Signal } from '/@/components/Common/Event/Signal'
import { proxy } from 'comlink'
import type { CompilerService, ICompilerOptions } from './Worker/Service'
// import CompilerWorker from './Worker/Main?worker'
import { WorkerManager } from '/@/components/Worker/Manager'
import { Project } from '../Projects/Project/Project'
import { CompilerManager } from './CompilerManager'
import { FileType } from '../Data/FileType'
import { isUsingFileSystemPolyfill } from '../FileSystem/Polyfill'

interface ICompilerStartOptions {
	mode: 'dev' | 'build'
	restartDevServer: boolean
}
export class Compiler extends WorkerManager<
	typeof CompilerService,
	CompilerService,
	ICompilerStartOptions,
	void
> {
	public readonly ready = new Signal<void>()

	constructor(
		protected parent: CompilerManager,
		protected project: Project,
		protected config: string
	) {
		super({
			icon: 'mdi-cogs',
			name: 'taskManager.tasks.compiler.title',
			description: 'taskManager.tasks.compiler.description',
		})
		this.ready.dispatch()
	}

	createWorker() {
		// this.worker = new CompilerWorker()
		this.worker = new Worker('./Worker/Service.ts', {
			type: 'module',
		})
	}

	async dispose() {
		await super.dispose()
		this.parent.remove(this.config)
	}

	async start({ mode, restartDevServer }: ICompilerStartOptions) {
		await this.ready.fired
		this.ready.resetSignal()
		const app = await App.getApp()
		await app.comMojang.fired
		await app.project.packIndexer.fired

		// Instantiate the worker TaskService
		if (!this._service) {
			this._service = await new this.workerClass!(
				this.project.baseDirectory,
				app.fileSystem.baseDirectory,
				app.comMojang.fileSystem.baseDirectory,
				{
					config: this.config,
					mode,
					isFileRequest: false,
					isDevServerRestart: restartDevServer,
					plugins: this.parent.getCompilerPlugins(),
					pluginFileTypes: FileType.getPluginFileTypes(),
					allFiles: await app.project.packIndexer.service.getAllFiles(
						false
					),
				}
			)
		} else {
			await this.updateService(mode, false, restartDevServer)
		}

		// Listen to task progress and update UI
		await this.service.on(
			proxy(([current, total]) => {
				this.task?.update(current, total)
			}),
			false
		)

		console.time('[TASK] Compiling project (total)')

		// Start service
		let [files, deletedFiles] = (await app.project?.packIndexer.fired) ?? []
		if (mode === 'build' || restartDevServer)
			files =
				(await this.project.packIndexer.service!.getAllFiles()) ?? []

		console.log(files)

		await this._service.start([files, deletedFiles])
		this._service.disposeListeners()
		this.ready.dispatch()
		console.timeEnd('[TASK] Compiling project (total)')
	}
	async updateService(
		mode: 'build' | 'dev',
		isFileRequest: boolean,
		isDevServerRestart: boolean
	) {
		await this.updateDirectoryHandles()
		await this.service.updateMode(mode, isFileRequest, isDevServerRestart)
		await this.service.updatePlugins(
			this.parent.getCompilerPlugins(),
			FileType.getPluginFileTypes()
		)
	}
	async updateDirectoryHandles() {
		if (!isUsingFileSystemPolyfill) return

		const app = await App.getApp()

		await this.service.updateDirectoryHandles(
			this.project.baseDirectory,
			app.fileSystem.baseDirectory
		)
	}

	async updateFiles(filePaths: string[]) {
		console.time('[Worker] Compiler: Update Files')
		await this.ready.fired
		this.ready.resetSignal()

		await this.updateService('dev', false, false)
		await this.service.updateFiles(filePaths)
		this.ready.dispatch()
		console.timeEnd('[Worker] Compiler: Update Files')
	}

	async compileWithFile(filePath: string, file: File) {
		await this.ready.fired
		this.ready.resetSignal()

		await this.updateService('dev', true, false)

		const fileBuffer = new Uint8Array(await file.arrayBuffer())
		const [dependencies, compiled] = await this.service.compileWithFile(
			filePath,
			fileBuffer
		)

		this.ready.dispatch()
		return <const>[dependencies, compiled ?? fileBuffer]
	}

	async unlink(path: string) {
		await this.ready.fired
		this.ready.resetSignal()

		await this.updateService('dev', false, false)
		await this.service.unlink(path)

		this.ready.dispatch()
	}

	async getCompilerOutputPath(path: string) {
		await this.ready.fired
		this.ready.resetSignal()

		await this.updateService('dev', false, false)
		const transformedPath = await this.service.getCompilerOutputPath(path)

		this.ready.dispatch()

		return transformedPath
	}
}
