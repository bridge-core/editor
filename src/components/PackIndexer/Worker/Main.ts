import { FileType } from '@/appCycle/FileType'
import * as Comlink from 'comlink'
import { TaskService } from '@/components/TaskManager/WorkerTask'
import { LightningStore } from './LightningCache/LightningStore'
import {
	fileStore,
	getCategoryDirectory,
	getFileStoreDirectory,
	PackSpider,
} from './PackSpider/PackSpider'
import { execute } from '@/components/Plugins/Scripts/execute'
import { LightningCache } from './LightningCache/LightningCache'
export { ILightningInstruction } from './LightningCache/LightningCache'

export class PackIndexerService extends TaskService {
	protected lightningStore: LightningStore
	protected packSpider: PackSpider
	protected lightningCache: LightningCache

	constructor(baseDirectory: FileSystemDirectoryHandle) {
		super('packIndexer', baseDirectory)
		this.lightningStore = new LightningStore(this)
		this.packSpider = new PackSpider(this, this.lightningStore)
		this.lightningCache = new LightningCache(this, this.lightningStore)
	}

	async onStart() {
		console.time('[WORKER] SETUP')
		this.lightningStore.reset()
		await FileType.setup()

		console.timeEnd('[WORKER] SETUP')

		console.time('[WORKER] LightningCache')
		const filePaths = await this.lightningCache.start()
		console.timeEnd('[WORKER] LightningCache')

		console.time('[WORKER] PackSpider')
		await this.packSpider.setup(filePaths)
		console.timeEnd('[WORKER] PackSpider')
	}

	async updateFile(filePath: string) {
		await FileType.setup()
		await this.lightningCache.processFile(
			filePath,
			await this.fileSystem.getFileHandle(filePath)
		)
		await this.lightningStore.saveStore()
		await this.packSpider.updateFile(filePath)
	}

	async readdir(path: string[]) {
		if (path.length === 0) return getFileStoreDirectory()
		if (path.length === 1) return getCategoryDirectory(path[0])
		return fileStore[path[0]][path[1]].toDirectory()
	}
}

Comlink.expose(PackIndexerService, self)
