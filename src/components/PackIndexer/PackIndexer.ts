import { App } from '/@/App'
import { proxy, Remote, wrap } from 'comlink'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { PackIndexerService as TPackIndexerService } from './Worker/Main'
import PackIndexerWorker from './Worker/Main?worker'
import { AnyDirectoryHandle } from '../FileSystem/Types'
import type { Project } from '/@/components/Projects/Project/Project'
import { Mutex } from '../Common/Mutex'
import { Signal } from '../Common/Event/Signal'
import { Task } from '../TaskManager/Task'

const PackIndexerService = wrap<typeof TPackIndexerService>(
	new PackIndexerWorker()
)

const taskOptions = {
	icon: 'mdi-flash-outline',
	name: 'taskManager.tasks.packIndexing.title',
	description: 'taskManager.tasks.packIndexing.description',
}

export class PackIndexer extends Signal<[string[], string[]]> {
	protected isPackIndexerFree = new Mutex()
	protected _service: Remote<TPackIndexerService> | null = null
	protected task?: Task

	constructor(
		protected project: Project,
		protected baseDirectory: AnyDirectoryHandle
	) {
		super()
	}

	get service() {
		if (!this._service)
			throw new Error(`Accessing service without service being defined`)
		return this._service
	}

	async activate(forceRefreshCache: boolean) {
		console.time('[TASK] Indexing Packs (Total)')

		this.isPackIndexerFree.lock()
		const app = this.project.app
		this.task = app.taskManager.create(taskOptions)

		// Instaniate the worker TaskService
		this._service = await new PackIndexerService(
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
		await this._service?.on(
			proxy(([current, total]) => {
				this.task?.update(current, total)
			}),
			false
		)

		// Start service
		const [changedFiles, deletedFiles] = await this._service?.start(
			forceRefreshCache
		)
		await this._service?.disposeListeners()
		this.task.complete()
		this.isPackIndexerFree.unlock()

		console.timeEnd('[TASK] Indexing Packs (Total)')

		// Only dispatch signal if service wasn't disposed in the meantime
		if (this._service) this.dispatch([changedFiles, deletedFiles])
		return <const>[changedFiles, deletedFiles]
	}

	async deactivate() {
		this.resetSignal()
		await this._service?.disposeListeners()
		this._service = null
		this.task?.complete()
	}

	async updateFile(
		filePath: string,
		fileContent?: string,
		isForeignFile = false,
		hotUpdate = false
	) {
		await this.isPackIndexerFree.lock()

		await this.service.updatePlugins(App.fileType.getPluginFileTypes())
		const anyFileChanged = await this.service.updateFile(
			filePath,
			fileContent,
			isForeignFile,
			hotUpdate
		)

		this.isPackIndexerFree.unlock()
		return anyFileChanged
	}
	async rename(fromPath: string, toPath: string, saveStore = true) {
		await this.isPackIndexerFree.lock()

		await this.service.updatePlugins(App.fileType.getPluginFileTypes())

		await this.service.rename(fromPath, toPath, saveStore)

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
		const anyFileChanged = await this.service.updateFiles(
			filePaths,
			hotUpdate
		)

		this.isPackIndexerFree.unlock()
		return anyFileChanged
	}
	async unlinkFile(path: string, saveCache = true) {
		await this.isPackIndexerFree.lock()

		await this.service.updatePlugins(App.fileType.getPluginFileTypes())

		await this.service.unlinkFile(path, saveCache)

		this.isPackIndexerFree.unlock()
	}
	async saveCache() {
		await this.isPackIndexerFree.lock()

		await this.service.saveCache()

		this.isPackIndexerFree.unlock()
	}
}
