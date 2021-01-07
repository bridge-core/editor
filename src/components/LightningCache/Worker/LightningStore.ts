import { FileType } from '@/appCycle/FileType'
import { FileSystem } from '@/components/FileSystem/Main'
import { hashString } from '@/utils/hash'
import type { PackIndexerService } from './Main'

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

	async save(
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
}
