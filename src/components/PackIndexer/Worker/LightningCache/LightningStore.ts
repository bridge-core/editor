import { FileType } from '@/components/Data/FileType'
import { FileSystem } from '@/components/FileSystem/Main'
import { PackIndexerService } from '../Main'

type TStore = Record<string, Record<string, IStoreEntry>>
interface IStoreEntry {
	hash: string
	data?: Record<string, string[]>
}

/**
 * Implements the lightning cache interaction with the file system
 */
export class LightningStore {
	protected store: TStore | undefined
	protected fs: FileSystem
	constructor(service: PackIndexerService) {
		this.fs = service.fileSystem
	}

	reset() {
		this.store = undefined
	}
	protected async loadStore() {
		if (!this.store) {
			try {
				this.store = await this.fs.readJSON(
					'bridge/lightningCache.json'
				)
			} catch {
				this.store = {}
			}
		}
	}
	async saveStore() {
		await this.fs.mkdir('bridge')
		await this.fs.writeJSON('bridge/lightningCache.json', this.store)
	}

	async add(
		filePath: string,
		hash: string,
		fileData?: Record<string, string[]>
	) {
		await this.loadStore()
		const fileType = FileType.getId(filePath)
		if (!this.store![fileType]) this.store![fileType] = {}

		this.store![fileType][filePath] = {
			hash,
			data: fileData,
		}
	}

	async getHash(filePath: string) {
		await this.loadStore()
		const fileType = FileType.getId(filePath)

		return this.store![fileType]?.[filePath]?.hash ?? ''
	}

	async find(
		findFileType: string,
		whereCacheKey: string,
		matchesOneOf: string[],
		fetchAll = false
	) {
		if (matchesOneOf.length === 0) return []
		await this.loadStore()
		const relevantStore = this.store![findFileType]

		const resultingFiles: string[] = []

		// Iterating over files
		for (const filePath in relevantStore) {
			const cacheEntries =
				relevantStore[filePath].data?.[whereCacheKey] ?? []

			if (cacheEntries.find(entry => matchesOneOf.includes(entry))) {
				if (!fetchAll) return [filePath]
				else resultingFiles.push(filePath)
			}
		}

		return resultingFiles
	}
	async findMultiple(
		findFileTypes: string[],
		whereCacheKey: string,
		matchesOneOf: string[],
		fetchAll = false
	) {
		const resultingFiles: string[] = []

		for (const findFileType of findFileTypes) {
			const foundFiles = await this.find(
				findFileType,
				whereCacheKey,
				matchesOneOf,
				fetchAll
			)
			if (foundFiles.length > 0 && !fetchAll) return foundFiles

			resultingFiles.push(...foundFiles)
		}

		return resultingFiles
	}

	async forEach(
		fileType: string,
		cb: (filePath: string, storeEntry: IStoreEntry) => Promise<void> | void
	) {
		await this.loadStore()
		const relevantStore = this.store![fileType]

		const promises: (void | Promise<void>)[] = []
		for (const filePath in relevantStore) {
			promises.push(cb(filePath, relevantStore[filePath]))
		}

		await Promise.all(promises)
	}

	async get(filePath: string, fileType = FileType.getId(filePath)) {
		await this.loadStore()

		return this.store![fileType]?.[filePath] ?? {}
	}

	async allFiles() {
		await this.loadStore()
		const filePaths = []

		for (const fileType in this.store) {
			for (const filePath in this.store[fileType]) {
				filePaths.push(filePath)
			}
		}

		return filePaths
	}

	async getAllFrom(fileType: string) {
		await this.loadStore()
		const collectedData: Record<string, string[]> = {}

		for (const filePath in this.store![fileType] ?? {}) {
			const cachedData =
				(this.store![fileType][filePath] ?? {}).data ?? {}

			for (const cacheKey in cachedData) {
				if (collectedData[cacheKey])
					collectedData[cacheKey].push(...cachedData[cacheKey])
				else collectedData[cacheKey] = [...cachedData[cacheKey]]
			}
		}

		return collectedData
	}
}
