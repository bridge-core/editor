import { App } from '/@/App'
import { WorkerManager } from '/@/components/Worker/Manager'
import * as Comlink from 'comlink'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { IPackIndexerOptions, PackIndexerService } from './Worker/Main'
import PackIndexerWorker from './Worker/Main?worker'
import TestWorker from '/@/utils/locales?worker'

export class PackIndexer extends WorkerManager<
	PackIndexerService,
	IPackIndexerOptions,
	boolean,
	string[]
> {
	constructor(
		protected app: App,
		protected baseDirectory: FileSystemDirectoryHandle
	) {
		super({
			icon: 'mdi-flash-outline',
			name: 'taskManager.tasks.packIndexing.title',
			description: 'taskManager.tasks.packIndexing.description',
		})
	}

	createWorker() {
		this.worker = new PackIndexerWorker()
	}

	deactivate() {
		super.deactivate()
	}

	protected async start(forceRefreshCache: boolean) {
		console.time('[TASK] Indexing Packs (Total)')

		// Instaniate the worker TaskService
		this._service = await new this.workerClass!({
			projectDirectory: this.baseDirectory,
			baseDirectory: this.app.fileSystem.baseDirectory,
			disablePackSpider: !settingsState?.general?.enablePackSpider,
			noFullLightningCacheRefresh:
				!forceRefreshCache &&
				!settingsState?.general?.fullLightningCacheRefresh,
		})

		// Listen to task progress and update UI
		this._service.on(
			Comlink.proxy(([current, total]) => {
				if (current === total) this.task?.complete()
				this.task?.update(current, total)
			}),
			false
		)

		// Start service
		const changedFiles = await this._service!.start()
		console.timeEnd('[TASK] Indexing Packs (Total)')
		return changedFiles
	}

	async updateFile(filePath: string) {
		await this.service!.updateFile(filePath)
	}

	readdir(path: string[], ..._: any[]) {
		return this.service!.readdir(path)
	}

	get service() {
		return this._service
	}
}
