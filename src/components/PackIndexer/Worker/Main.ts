// @ts-ignore Make "path" work on this worker
globalThis.process = {
	cwd: () => '',
	env: {},
	release: {
		name: 'browser',
	},
}

import '/@/components/FileSystem/Virtual/Comlink'
import { FileTypeLibrary, IFileType } from '/@/components/Data/FileType'
import { expose } from 'comlink'
import { TaskService } from '/@/components/TaskManager/WorkerTask'
import { LightningStore } from './LightningCache/LightningStore'
import { PackSpider } from './PackSpider/PackSpider'
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
	projectPath: string
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
		this.config = new ProjectConfig(
			this.projectFileSystem,
			options.projectPath
		)
		this.fileType = new FileTypeLibrary(this.config)
		this.packType = new PackTypeLibrary(this.config)

		this.globalFileSystem = new FileSystem(baseDirectory)
		this.lightningStore = new LightningStore(
			this.projectFileSystem,
			this.fileType,
			options.projectPath
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
		if (!dataLoader.hasFired) await dataLoader.loadData()

		await Promise.all([
			this.fileType.setup(dataLoader),
			this.packType.setup(dataLoader),
			this.config.setup(false),
		])

		console.timeEnd('[WORKER] SETUP')

		console.time('[WORKER] LightningCache')
		const [filePaths, changedFiles, deletedFiles] =
			await this.lightningCache.start(forceRefresh)
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
			if (!hotUpdate) await this.lightningStore.saveStore(false)
			await this.packSpider.updateFile(filePath)
		}

		return fileDidChange
	}
	async updateFiles(filePaths: string[], hotUpdate = false) {
		let anyFileChanged = false
		for (let i = 0; i < filePaths.length; i++) {
			const fileDidChange = await this.updateFile(
				filePaths[i],
				undefined,
				false,
				false
			)
			if (fileDidChange) anyFileChanged = true
		}

		if (!hotUpdate && anyFileChanged)
			await this.lightningStore.saveStore(false)

		return anyFileChanged
	}
	hasFile(filePath: string) {
		return this.lightningStore.has(filePath)
	}

	async rename(fromPath: string, toPath: string, saveStore = true) {
		this.lightningStore.rename(fromPath, toPath)
		if (saveStore) await this.lightningStore.saveStore(false)
	}

	unlinkFile(path: string, saveCache = true) {
		return this.lightningCache.unlinkFile(path, saveCache)
	}
	saveCache() {
		return this.lightningStore.saveStore(false)
	}

	updatePlugins(pluginFileTypes: IFileType[]) {
		this.fileType.setPluginFileTypes(pluginFileTypes)
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

	getAllFiles(fileType?: string, sorted = false) {
		if (sorted)
			return this.lightningStore
				.allFiles(fileType)
				.sort((a, b) => a.localeCompare(b))
		return this.lightningStore.allFiles(fileType)
	}
	getFileDiagnostics(filePath: string) {
		return this.packSpider.getDiagnostics(filePath)
	}
	getConnectedFiles(filePath: string) {
		return this.packSpider.getConnectedFiles(filePath)
	}

	getSchemasFor(fileType: string, fromFilePath?: string) {
		return this.lightningStore.getSchemasFor(fileType, fromFilePath)
	}
	getCacheDataFor(fileType: string, filePath?: string, cacheKey?: string) {
		return this.lightningStore.getCacheDataFor(fileType, filePath, cacheKey)
	}
}

expose(PackIndexerService, self)
