// @ts-ignore Make "path" work on this worker
globalThis.process = {
	cwd: () => '',
	env: {},
}

import '/@/components/FileSystem/Virtual/Comlink'
import { FileTypeLibrary, IFileType } from '/@/components/Data/FileType'
import { expose } from 'comlink'
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
import { PackTypeLibrary } from '/@/components/Data/PackType'
import { DataLoader } from '/@/components/Data/DataLoader'
import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { ProjectConfig } from '/@/components/Projects/Project/Config'
export type { ILightningInstruction } from './LightningCache/LightningCache'

export interface IPackIndexerOptions {
	pluginFileTypes: IFileType[]
	disablePackSpider: boolean
	noFullLightningCacheRefresh: boolean
}

const dataLoader: DataLoader = new DataLoader()
export class PackIndexerService extends TaskService<
	readonly [string[], string[]],
	boolean
> {
	protected lightningStore: LightningStore
	protected packSpider: PackSpider
	protected lightningCache: LightningCache
	public fileSystem: FileSystem
	public projectFileSystem: FileSystem
	public globalFileSystem: FileSystem
	public config: ProjectConfig
	public fileType: FileTypeLibrary
	public packType: PackTypeLibrary

	constructor(
		protected projectDirectory: AnyDirectoryHandle,
		baseDirectory: AnyDirectoryHandle,
		protected readonly options: IPackIndexerOptions
	) {
		super()

		this.fileSystem = new FileSystem(baseDirectory)
		this.projectFileSystem = new FileSystem(projectDirectory)
		this.config = new ProjectConfig(new FileSystem(projectDirectory))
		this.fileType = new FileTypeLibrary(this.config)
		this.packType = new PackTypeLibrary(this.config)

		this.globalFileSystem = new FileSystem(baseDirectory)
		this.lightningStore = new LightningStore(
			this.projectFileSystem,
			this.fileType
		)
		this.packSpider = new PackSpider(this, this.lightningStore)
		this.lightningCache = new LightningCache(this, this.lightningStore)
		this.fileType.setPluginFileTypes(options.pluginFileTypes)
	}

	getOptions() {
		return {
			projectDirectory: this.projectDirectory,
			baseDirectory: this.fileSystem.baseDirectory,
			...this.options,
		}
	}

	async onStart(forceRefresh: boolean) {
		console.time('[WORKER] SETUP')
		this.lightningStore.reset()

		await Promise.all([
			this.fileType.setup(dataLoader),
			this.packType.setup(dataLoader),
			this.config.setup(false),
		])

		console.timeEnd('[WORKER] SETUP')

		console.time('[WORKER] LightningCache')
		const [
			filePaths,
			changedFiles,
			deletedFiles,
		] = await this.lightningCache.start(forceRefresh)
		console.timeEnd('[WORKER] LightningCache')

		console.time('[WORKER] PackSpider')
		await this.packSpider.setup(filePaths)
		console.timeEnd('[WORKER] PackSpider')

		return <const>[changedFiles, deletedFiles]
	}

	async updateFile(
		filePath: string,
		fileContent?: string,
		isForeignFile = false,
		hotUpdate = false
	) {
		const fileDidChange = await this.lightningCache.processFile(
			filePath,
			fileContent ?? (await this.fileSystem.getFileHandle(filePath)),
			isForeignFile
		)

		if (fileDidChange) {
			if (!hotUpdate) await this.lightningStore.saveStore()
			await this.packSpider.updateFile(filePath)
		}
	}
	async updateFiles(filePaths: string[], hotUpdate = false) {
		for (let i = 0; i < filePaths.length; i++) {
			await this.updateFile(filePaths[i], undefined, false, false)
		}

		if (!hotUpdate) await this.lightningStore.saveStore()
	}
	hasFile(filePath: string) {
		return this.lightningStore.has(filePath)
	}

	unlink(path: string) {
		return this.lightningCache.unlink(path)
	}

	updatePlugins(pluginFileTypes: IFileType[]) {
		this.fileType.setPluginFileTypes(pluginFileTypes)
	}

	async readdir(path: string[]) {
		// TODO(Dash): Re-enable pack spider
		if (this.options.disablePackSpider || true) {
			if (path.length > 0)
				return (
					await this.globalFileSystem.readdir(path.join('/'), {
						withFileTypes: true,
					})
				).map((dirent) => ({
					kind: dirent.kind,
					name: dirent.name,
					path: path.concat([dirent.name]),
				}))

			return []
		}

		if (path.length === 0) return []
		if (path.length === 1) return getFileStoreDirectory(path[0])
		if (path.length === 2) return getCategoryDirectory(path[0], path[1])
		return fileStore[path[0]][path[1]][path[2]].toDirectory()
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

expose(PackIndexerService, self)
