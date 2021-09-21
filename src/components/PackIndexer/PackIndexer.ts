import { App } from '/@/App'
import { WorkerManager } from '/@/components/Worker/Manager'
import { proxy } from 'comlink'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import type { PackIndexerService } from './Worker/Main'
import { FileType } from '/@/components/Data/FileType'
import PackIndexerWorker from './Worker/Main?worker'
import { Signal } from '../Common/Event/Signal'
import { AnyDirectoryHandle } from '../FileSystem/Types'

export class PackIndexer extends WorkerManager<
	typeof PackIndexerService,
	PackIndexerService,
	boolean,
	readonly [string[], string[]]
> {
	protected ready = new Signal<void>()
	constructor(
		protected app: App,
		protected baseDirectory: AnyDirectoryHandle
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
		this._service = await new this.workerClass!(
			this.baseDirectory,
			this.app.fileSystem.baseDirectory,
			{
				disablePackSpider: !(
					settingsState?.general?.enablePackSpider ?? false
				),
				pluginFileTypes: FileType.getPluginFileTypes(),
				noFullLightningCacheRefresh:
					!forceRefreshCache &&
					!settingsState?.general?.fullLightningCacheRefresh,
			}
		)

		// Listen to task progress and update UI
		await this.service.on(
			proxy(([current, total]) => {
				this.task?.update(current, total)
			}),
			false
		)

		// Start service
		const [changedFiles, deletedFiles] = await this.service.start(
			forceRefreshCache
		)
		await this.service.disposeListeners()
		this.ready.dispatch()
		console.timeEnd('[TASK] Indexing Packs (Total)')
		return <const>[changedFiles, deletedFiles]
	}

	async updateFile(
		filePath: string,
		fileContent?: string,
		isForeignFile = false
	) {
		await this.ready.fired
		this.ready.resetSignal()

		await this.service.updatePlugins(FileType.getPluginFileTypes())
		await this.service.updateFile(filePath, fileContent, isForeignFile)

		this.ready.dispatch()
	}
	async updateFiles(filePaths: string[]) {
		await this.ready.fired
		this.ready.resetSignal()

		await this.service.updatePlugins(FileType.getPluginFileTypes())

		for (const filePath of filePaths) {
			await this.service.updateFile(filePath)
		}

		this.ready.dispatch()
	}
	async unlink(path: string) {
		await this.ready.fired
		this.ready.resetSignal()

		await this.service.updatePlugins(FileType.getPluginFileTypes())

		await this.service.unlink(path)

		this.ready.dispatch()
	}

	async readdir(path: string[], ..._: any[]) {
		await this.fired

		return await this.service.readdir(path)
	}
}
