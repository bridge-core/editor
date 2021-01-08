import { FileType } from '@/appCycle/FileType'
import { FileSystem } from '@/components/FileSystem/Main'
import { hashString } from '@/utils/hash'
import { PackIndexerService } from './Main'

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
		fileContent: string,
		fileData?: Record<string, string[]>
	) {
		await this.loadStore()
		const fileType = FileType.getId(filePath)
		if (!this.store![fileType]) this.store![fileType] = {}

		this.store![fileType][filePath] = {
			hash: await hashString(fileContent),
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
		matchesOneOf: string[]
	) {
		return (
			await Promise.all(
				findFileTypes.map(findFileType =>
					this.find(findFileType, whereCacheKey, matchesOneOf, true)
				)
			)
		).flat()
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
}
