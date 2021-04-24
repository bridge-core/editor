import { App } from '/@/App'
import { WorkerManager } from '/@/components/Worker/Manager'
import { proxy } from 'comlink'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { IPackIndexerOptions, PackIndexerService } from './Worker/Main'
import { FileType } from '/@/components/Data/FileType'
// import PackIndexerWorker from './Worker/Main?worker'

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
		// this.worker = new PackIndexerWorker()
		this.worker = new Worker('./Worker/Main.ts', {
			type: 'module',
		})
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
			pluginFileTypes: FileType.getPluginFileTypes(),
			noFullLightningCacheRefresh:
				!forceRefreshCache &&
				!settingsState?.general?.fullLightningCacheRefresh,
		})

		// Listen to task progress and update UI
		await this._service.on(
			proxy(([current, total]) => {
				this.task?.update(current, total)
			}),
			false
		)

		// Start service
		const changedFiles = await this._service!.start()
		await this._service.disposeListeners()
		console.timeEnd('[TASK] Indexing Packs (Total)')
		return changedFiles
	}

	async updateFile(filePath: string, fileContent?: string) {
		await this.fired
		await this.service!.updatePlugins(FileType.getPluginFileTypes())
		await this.service!.updateFile(filePath, fileContent)
	}

	async readdir(path: string[], ..._: any[]) {
		await this.fired
		return await this.service!.readdir(path)
	}

	get service() {
		return this._service
	}
}
