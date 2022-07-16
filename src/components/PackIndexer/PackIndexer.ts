import { App } from '/@/App'
import { WorkerManager } from '/@/components/Worker/Manager'
import { proxy } from 'comlink'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import type { PackIndexerService } from './Worker/Main'
import PackIndexerWorker from './Worker/Main?worker'
import { AnyDirectoryHandle } from '../FileSystem/Types'
import type { Project } from '/@/components/Projects/Project/Project'
import { Mutex } from '../Common/Mutex'

export class PackIndexer extends WorkerManager<
	typeof PackIndexerService,
	PackIndexerService,
	boolean,
	readonly [string[], string[]]
> {
	protected isPackIndexerFree = new Mutex()
	constructor(
		protected project: Project,
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
		await this.isPackIndexerFree.lock()

		// Instaniate the worker TaskService
		this._service = await new this.workerClass!(
			this.baseDirectory,
			this.project.app.fileSystem.baseDirectory,
			{
				disablePackSpider: !(
					settingsState?.general?.enablePackSpider ?? false
				),
				pluginFileTypes: App.fileType.getPluginFileTypes(),
				noFullLightningCacheRefresh:
					!forceRefreshCache &&
					!settingsState?.general?.fullLightningCacheRefresh,
				projectPath: this.project.projectPath,
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
		this.isPackIndexerFree.unlock()
		console.timeEnd('[TASK] Indexing Packs (Total)')
		return <const>[changedFiles, deletedFiles]
	}

	async updateFile(
		filePath: string,
		fileContent?: string,
		isForeignFile = false,
		hotUpdate = false
	) {
		await this.isPackIndexerFree.lock()

		await this.service.updatePlugins(App.fileType.getPluginFileTypes())
		await this.service.updateFile(
			filePath,
			fileContent,
			isForeignFile,
			hotUpdate
		)

		this.isPackIndexerFree.unlock()
	}
	async hasFile(filePath: string) {
		await this.isPackIndexerFree.lock()

		const res = await this.service.hasFile(filePath)

		this.isPackIndexerFree.unlock()

		return res
	}
	async updateFiles(filePaths: string[], hotUpdate = false) {
		await this.isPackIndexerFree.lock()

		await this.service.updatePlugins(App.fileType.getPluginFileTypes())
		await this.service.updateFiles(filePaths, hotUpdate)

		this.isPackIndexerFree.unlock()
	}
	async unlink(path: string) {
		await this.isPackIndexerFree.lock()

		await this.service.updatePlugins(App.fileType.getPluginFileTypes())

		await this.service.unlink(path)

		this.isPackIndexerFree.unlock()
	}
}
