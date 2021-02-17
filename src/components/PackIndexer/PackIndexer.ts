import { App } from '@/App'
import { Signal } from '@/components/Common/Event/Signal'
import * as Comlink from 'comlink'
import { settingsState } from '../Windows/Settings/SettingsState'
import { PackIndexerService } from './Worker/Main'

export class PackIndexer extends Signal<string[]> {
	protected worker: Worker | null = null
	protected workerClass: Comlink.Remote<
		typeof PackIndexerService
	> | null = null
	protected _service!: Comlink.Remote<PackIndexerService>
	public readonly ready = new Signal<boolean>()

	constructor(
		protected app: App,
		protected baseDirectory: FileSystemDirectoryHandle
	) {
		super()
	}

	activate(forceRefresh = false) {
		this.worker = new Worker('./Worker/Main.ts', {
			type: 'module',
		})
		this.workerClass = Comlink.wrap<typeof PackIndexerService>(this.worker)
		this.start(forceRefresh)
	}

	deactivate() {
		this.worker?.terminate()
		this.worker = null
		this.workerClass = null
	}

	protected async start(forceRefreshCache = false) {
		console.time('[TASK] Indexing Packs (Total)')
		this.resetSignal()

		this.ready.dispatch(false)

		const task = this.app.taskManager.create({
			icon: 'mdi-flash-outline',
			name: 'taskManager.tasks.packIndexing.title',
			description: 'taskManager.tasks.packIndexing.description',
		})

		// Instaniate the worker TaskService
		this._service = await new this.workerClass!(
			this.baseDirectory,
			this.app.fileSystem.baseDirectory,
			{
				disablePackSpider: !settingsState?.general?.enablePackSpider,
				noFullLightningCacheRefresh:
					!forceRefreshCache &&
					!settingsState?.general?.fullLightningCacheRefresh,
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
		const changedFiles = await this.service.start()
		this.ready.dispatch(true)

		this.dispatch(changedFiles)
		console.timeEnd('[TASK] Indexing Packs (Total)')
	}

	async updateFile(filePath: string) {
		await this.service.updateFile(filePath)
		App.eventSystem.dispatch('fileUpdated', filePath)
	}

	readdir(path: string[], ...args: any[]) {
		return this.service.readdir(path)
	}

	get service() {
		return this._service
	}
}
