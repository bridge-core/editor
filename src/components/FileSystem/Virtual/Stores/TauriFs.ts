import {
	createDir,
	readDir,
	writeBinaryFile,
	readBinaryFile,
	removeDir,
	removeFile,
	BaseDirectory,
} from '@tauri-apps/api/fs'
import { join } from '/@/utils/path'
import { BaseStore, type TStoreType } from './BaseStore'

export interface ITauriFsSerializedData {
	baseDirectory?: string
}

export class TauriFsStore extends BaseStore<ITauriFsSerializedData> {
	public readonly type = 'tauriFsStore'

	constructor(protected baseDirectory?: string) {
		super()
	}

	getBaseDirectory() {
		return this.baseDirectory
	}

	serialize() {
		return <const>{
			type: this.type,
			baseDirectory: this.baseDirectory,
		}
	}
	static deserialize(data: ITauriFsSerializedData & { type: TStoreType }) {
		return new TauriFsStore(data.baseDirectory)
	}

	async setup() {
		if (this.baseDirectory)
			await createDir(this.baseDirectory).catch(() => {
				// Ignore error if directory already exists
			})
	}

	resolvePath(path: string) {
		if (!this.baseDirectory) return path
		return join(this.baseDirectory, path)
	}

	async createDirectory(path: string) {
		await createDir(this.resolvePath(path)).catch(() => {
			// Ignore error if directory already exists
		})
	}

	async getDirectoryEntries(path: string) {
		const entries = await readDir(this.resolvePath(path))
		return <string[]>entries.map((entry) => entry.name)
	}

	async writeFile(path: string, data: Uint8Array) {
		await writeBinaryFile(this.resolvePath(path), data)
	}

	async readFile(path: string) {
		return await readBinaryFile(this.resolvePath(path))
	}

	async unlink(path: string) {
		const type = await this.typeOf(path)
		// Path does not exist, nothing to unlink
		if (type === null) return

		if (type === 'file') {
			await removeFile(this.resolvePath(path))
		} else {
			await removeDir(this.resolvePath(path))
		}
	}

	async typeOf(path: string) {
		try {
			await readDir(this.resolvePath(path))
			return 'directory'
		} catch (err) {
			try {
				await readBinaryFile(this.resolvePath(path))
				return 'file'
			} catch (err) {
				return null
			}
		}
	}
}
