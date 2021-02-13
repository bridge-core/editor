import { App } from '@/App'
import { Signal } from '@/components/Common/Event/Signal'
import * as Comlink from 'comlink'
import { InformedChoiceWindow } from '../Windows/InformedChoice/InformedChoice'
import { CompilerService } from './Worker/Main'
import JSON5 from 'json5'

const TaskService = Comlink.wrap<typeof CompilerService>(
	new Worker('./Worker/Main.ts', {
		type: 'module',
	})
)

export class Compiler extends Signal<void> {
	protected _services = new Map<string, Comlink.Remote<CompilerService>>()
	public readonly ready = new Signal<boolean>()
	protected compilerPlugins = new Map<string, string>()

	async start(projectName: string, mode: 'dev' | 'build', config: string) {
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
		let service = this._services.get(`${projectName}#${mode}.${config}`)
		if (!service) {
			service = await new TaskService(
				await app.fileSystem.getDirectoryHandle(
					`projects/${projectName}`
				),
				app.fileSystem.baseDirectory,
				{
					config,
					mode,
					plugins: Object.fromEntries(this.compilerPlugins.entries()),
				}
			)
			this._services.set(`${projectName}#${mode}.${config}`, service)
		} else {
			await service.updatePlugins(
				Object.fromEntries(this.compilerPlugins.entries())
			)
		}

		// Listen to task progress and update UI
		service.on(
			Comlink.proxy(([current, total]) => {
				if (current === total) task.complete()
				task.update(current, total)
			}),
			false
		)

		// Start service
		let files = await app.packIndexer.fired
		if (mode === 'build')
			files = await app.packIndexer.service.getAllFiles()

		await service.start(files)
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

	async getService(mode: 'dev' | 'build', config: string) {
		const app = await App.getApp()
		return this._services.get(`${app.selectedProject}#${mode}.${config}`)
	}

	async openWindow() {
		const app = await App.getApp()

		const configDir = await app.fileSystem.getDirectoryHandle(
			`projects/${app.selectedProject}/bridge/compiler`,
			{ create: true }
		)

		const informedChoice = new InformedChoiceWindow('sidebar.compiler.name')
		const actionManager = await informedChoice.actionManager

		for await (const entry of configDir.values()) {
			if (entry.kind !== 'file' || entry.name === '.DS_Store') continue

			const file = await entry.getFile()
			let config
			try {
				config = JSON5.parse(await file.text())
			} catch {
				continue
			}

			actionManager.create({
				icon: config.icon,
				name: config.name,
				description: config.description,
				onTrigger: () =>
					this.start(app.selectedProject!, 'build', entry.name),
			})
		}
	}

	async updateFile(mode: 'dev' | 'build', config: string, filePath: string) {
		const service = await this.getService(mode, config)
		if (!service) throw new Error(`Undefined service: "${mode}#${config}"`)
		await service.updatePlugins(
			Object.fromEntries(this.compilerPlugins.entries())
		)
		await service.updateFile(filePath)
	}
}
