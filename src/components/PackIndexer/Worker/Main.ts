import { FileType, IFileType } from '/@/components/Data/FileType'
import * as Comlink from 'comlink'
import { TaskService } from '/@/components/TaskManager/WorkerTask'
import { LightningStore } from './LightningCache/LightningStore'
import {
	fileStore,
	getCategoryDirectory,
	getFileStoreDirectory,
	PackSpider,
} from './PackSpider/PackSpider'
import { LightningCache } from './LightningCache/LightningCache'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
export type { ILightningInstruction } from './LightningCache/LightningCache'

export interface IPackIndexerOptions {
	projectDirectory: FileSystemDirectoryHandle
	baseDirectory: FileSystemDirectoryHandle
	pluginFileTypes: IFileType[]
	disablePackSpider: boolean
	noFullLightningCacheRefresh: boolean
}

export class PackIndexerService extends TaskService<string[]> {
	protected lightningStore: LightningStore
	protected packSpider: PackSpider
	protected lightningCache: LightningCache

	constructor(protected readonly options: IPackIndexerOptions) {
		super('packIndexer', options.projectDirectory)
		this.lightningStore = new LightningStore(this.fileSystem)
		this.packSpider = new PackSpider(this, this.lightningStore)
		this.lightningCache = new LightningCache(this, this.lightningStore)
		FileType.setPluginFileTypes(options.pluginFileTypes)
	}

	getOptions() {
		return this.options
	}

	async onStart() {
		console.time('[WORKER] SETUP')
		this.lightningStore.reset()
		await FileType.setup(new FileSystem(this.options.baseDirectory))

		console.timeEnd('[WORKER] SETUP')

		console.time('[WORKER] LightningCache')
		const [filePaths, changedFiles] = await this.lightningCache.start()
		console.timeEnd('[WORKER] LightningCache')

		console.time('[WORKER] PackSpider')
		await this.packSpider.setup(filePaths)
		console.timeEnd('[WORKER] PackSpider')

		return changedFiles
	}

	async updateFile(filePath: string) {
		await this.lightningCache.processFile(
			filePath,
			await this.fileSystem.getFileHandle(filePath)
		)
		await this.lightningStore.saveStore()
		await this.packSpider.updateFile(filePath)
	}

	updatePlugins(pluginFileTypes: IFileType[]) {
		FileType.setPluginFileTypes(pluginFileTypes)
	}

	async readdir(path: string[]) {
		if (this.options.disablePackSpider) {
			if (path.length > 0)
				return (
					await this.fileSystem.readdir(path.join('/'), {
						withFileTypes: true,
					})
				).map((dirent) => ({
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

	getAllFiles(sorted = false) {
		if (sorted)
			return this.lightningStore
				.allFiles()
				.sort((a, b) => a.localeCompare(b))
		return this.lightningStore.allFiles()
	}

	getSchemasFor(fileType: string, fromFilePath?: string) {
		return this.lightningStore.getSchemasFor(fileType, fromFilePath)
	}
	getCacheDataFor(fileType: string, filePath?: string, cacheKey?: string) {
		return this.lightningStore.getCacheDataFor(fileType, filePath, cacheKey)
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

	return projects.map((dirent) => {
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
