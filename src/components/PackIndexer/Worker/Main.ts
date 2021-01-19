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
import { LightningCache } from './LightningCache/LightningCache'
import { FileSystem } from '@/components/FileSystem/Main'
export { ILightningInstruction } from './LightningCache/LightningCache'

export interface IWorkerSettings {
	disablePackSpider: boolean
	noFullLightningCacheRefresh: boolean
}

export class PackIndexerService extends TaskService {
	protected lightningStore: LightningStore
	protected packSpider: PackSpider
	protected lightningCache: LightningCache

	constructor(
		baseDirectory: FileSystemDirectoryHandle,
		readonly settings: IWorkerSettings
	) {
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
		if (this.settings.disablePackSpider) {
			if (path.length > 0)
				return (
					await this.fileSystem.readdir(path.join('/'), {
						withFileTypes: true,
					})
				).map(dirent => ({
					kind: dirent.kind,
					name: dirent.name,
					path: path.concat([dirent.name]),
				}))

			return (
				await Promise.all([
					loadPack('BP', this.fileSystem),
					loadPack('RP', this.fileSystem),
					loadPack('SP', this.fileSystem),
				])
			).flat()
		}

		if (path.length === 0) return getFileStoreDirectory()
		if (path.length === 1) return getCategoryDirectory(path[0])
		return fileStore[path[0]][path[1]].toDirectory()
	}

	find(
		findFileType: string,
		whereCacheKey: string,
		matchesOneOf: string[],
		fetchAll = false
	) {
		return this.lightningStore.find(
			findFileType,
			whereCacheKey,
			matchesOneOf,
			fetchAll
		)
	}

	findMultiple(
		findFileTypes: string[],
		whereCacheKey: string,
		matchesOneOf: string[],
		fetchAll = false
	) {
		return this.lightningStore.findMultiple(
			findFileTypes,
			whereCacheKey,
			matchesOneOf,
			fetchAll
		)
	}

	getAllFiles() {
		return this.lightningStore.allFiles()
	}
}

async function loadPack(pack: string, fileSystem: FileSystem) {
	let projects
	try {
		projects = await fileSystem.readdir(pack, {
			withFileTypes: true,
		})
	} catch {
		return []
	}

	return projects.map(dirent => {
		const fileType = FileType.getId(`${pack}/${dirent.name}${'/test.json'}`)
		return {
			kind: dirent.kind,
			displayName:
				dirent.kind === 'file' || fileType === 'unknown'
					? dirent.name
					: undefined,
			name:
				dirent.kind === 'directory' && fileType !== 'unknown'
					? fileType
					: dirent.name,
			path: `${pack}/${dirent.name}`,
		}
	})
}

Comlink.expose(PackIndexerService, self)
