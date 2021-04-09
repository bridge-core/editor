import { App } from '/@/App'
import { Signal } from '/@/components/Common/Event/Signal'
import { proxy } from 'comlink'
import type { CompilerService, ICompilerOptions } from './Worker/Service'
// import CompilerWorker from './Worker/Main?worker'
import { WorkerManager } from '/@/components/Worker/Manager'
import { Project } from '../Projects/Project/Project'
import { CompilerManager } from './CompilerManager'
import { FileType } from '../Data/FileType'

export class Compiler extends WorkerManager<
	CompilerService,
	ICompilerOptions,
	'dev' | 'build',
	void
> {
	public readonly ready = new Signal<boolean>()

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

	async start(mode: 'dev' | 'build') {
		this.ready.dispatch(false)
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
				plugins: this.parent.getCompilerPlugins(),
				pluginFileTypes: FileType.getPluginFileTypes(),
			})
		} else {
			await this._service.updateMode(mode)
			await this._service.updatePlugins(
				this.parent.getCompilerPlugins(),
				FileType.getPluginFileTypes()
			)
		}

		// Listen to task progress and update UI
		this._service.on(
			proxy(([current, total]) => {
				this.task?.update(current, total)
			}),
			false
		)

		console.time('[TASK] Compiling project (total)')

		// Start service
		let files = (await app.project?.packIndexer.fired) ?? []
		if (mode === 'build')
			files =
				(await app.project?.packIndexer.service!.getAllFiles()) ?? []

		await this._service.start(files)
		this.ready.dispatch(true)
		console.timeEnd('[TASK] Compiling project (total)')
	}

	async updateFile(filePath: string) {
		await this.fired
		if (!this._service)
			throw new Error(
				`Trying to update file without service being defined`
			)

		await this._service.updateMode('dev')
		await this._service.updatePlugins(
			this.parent.getCompilerPlugins(),
			FileType.getPluginFileTypes()
		)
		await this._service.updateFile(filePath)
	}

	async compileWithFile(filePath: string, file: File) {
		await this.fired
		if (!this._service)
			throw new Error(
				`Trying to update file without service being defined`
			)

		await this._service.updateMode('dev')
		await this._service.updatePlugins(
			this.parent.getCompilerPlugins(),
			FileType.getPluginFileTypes()
		)

		const fileBuffer = new Uint8Array(await file.arrayBuffer())
		const sharedBuffer = new SharedArrayBuffer(fileBuffer.byteLength)
		const uint8Array = new Uint8Array(sharedBuffer)
		uint8Array.set(fileBuffer)

		return (
			(await this._service.compileWithFile(filePath, sharedBuffer)) ??
			fileBuffer
		)
	}
}
