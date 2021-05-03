import { App } from '/@/App'
import { Signal } from '/@/components/Common/Event/Signal'
import { proxy } from 'comlink'
import type { CompilerService, ICompilerOptions } from './Worker/Service'
// import CompilerWorker from './Worker/Main?worker'
import { WorkerManager } from '/@/components/Worker/Manager'
import { Project } from '../Projects/Project/Project'
import { CompilerManager } from './CompilerManager'
import { FileType } from '../Data/FileType'

interface ICompilerStartOptions {
	mode: 'dev' | 'build'
	restartDevServer: boolean
}
export class Compiler extends WorkerManager<
	CompilerService,
	ICompilerOptions,
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

		// Instantiate the worker TaskService
		if (!this._service) {
			this._service = await new this.workerClass!({
				projectDirectory: this.project.baseDirectory,
				baseDirectory: app.fileSystem.baseDirectory,
				comMojangDirectory: app.comMojang.fileSystem.baseDirectory,
				config: this.config,
				mode,
				isFileRequest: false,
				isDevServerRestart: restartDevServer,
				plugins: this.parent.getCompilerPlugins(),
				pluginFileTypes: FileType.getPluginFileTypes(),
			})
		} else {
			await this.service.updateMode(mode, false, restartDevServer)
			await this.service.updatePlugins(
				this.parent.getCompilerPlugins(),
				FileType.getPluginFileTypes()
			)
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
		let files = (await app.project?.packIndexer.fired) ?? []
		if (mode === 'build' || restartDevServer)
			files =
				(await this.project.packIndexer.service!.getAllFiles()) ?? []

		await this._service.start(files)
		this._service.disposeListeners()
		this.ready.dispatch()
		console.timeEnd('[TASK] Compiling project (total)')
	}

	async updateFiles(filePaths: string[]) {
		await this.ready.fired
		this.ready.resetSignal()

		await this.service.updateMode('dev', false, false)
		await this.service.updatePlugins(
			this.parent.getCompilerPlugins(),
			FileType.getPluginFileTypes()
		)
		await this.service.updateFiles(filePaths)
		this.ready.dispatch()
	}

	async compileWithFile(filePath: string, file: File) {
		await this.ready.fired
		this.ready.resetSignal()

		await this.service.updateMode('dev', true, false)
		await this.service.updatePlugins(
			this.parent.getCompilerPlugins(),
			FileType.getPluginFileTypes()
		)

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

		this.service.updateMode('dev', false, false)
		await this.service.updatePlugins(
			this.parent.getCompilerPlugins(),
			FileType.getPluginFileTypes()
		)
		await this.service.unlink(path)

		this.ready.dispatch()
	}
}
