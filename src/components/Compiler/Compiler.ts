import { App } from '@/App'
import { Signal } from '@/appCycle/EventSystem'
import * as Comlink from 'comlink'
import { CompilerService } from './Worker/Main'

const TaskService = Comlink.wrap<typeof CompilerService>(
	new Worker('./Worker/Main.ts', {
		type: 'module',
	})
)

export class Compiler extends Signal<void> {
	protected _service!: Comlink.Remote<CompilerService>
	public readonly ready = new Signal<boolean>()
	protected compilerPlugins = new Map<string, string>()

	async start(projectName: string) {
		this.resetSignal()
		this.ready.dispatch(false)
		const app = await App.getApp()
		await app.packIndexer.fired
		console.time('[TASK] Compiling project (total)')

		const task = app.taskManager.create({
			icon: 'mdi-cogs',
			name: 'taskManager.tasks.compiler.title',
			description: 'taskManager.tasks.compiler.description',
		})

		// Instaniate the worker TaskService
		this._service = await new TaskService(
			await app.fileSystem.getDirectoryHandle(`projects/${projectName}`),
			app.fileSystem.baseDirectory,
			{
				config: 'dev.json',
				plugins: Object.fromEntries(this.compilerPlugins.entries()),
			}
		)
		// Listen to task progress and update UI
		this._service.on(
			Comlink.proxy(([current, total]) => {
				if (current === total) task.complete()
				task.update(current, total)
			}),
			false
		)

		// Start service
		const files = await app.packIndexer.fired
		const errors = await this.service.start(files)
		errors.forEach(e => console.error(e))
		this.dispatch()
		this.ready.dispatch(true)
		console.timeEnd('[TASK] Compiling project (total)')
	}

	addCompilerPlugin(pluginId: string, srcPath: string) {
		if (this.compilerPlugins.has(pluginId))
			throw new Error(
				`Compiler plugin with id "${pluginId}" is already registered`
			)
		this.compilerPlugins.set(pluginId, srcPath)

		return {
			dispose: () => this.compilerPlugins.delete(pluginId),
		}
	}

	get service() {
		return this._service
	}
}
