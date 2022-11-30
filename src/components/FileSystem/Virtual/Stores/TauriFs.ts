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
	dir: BaseDirectory
}

export class TauriFsStore extends BaseStore<ITauriFsSerializedData> {
	public readonly type = 'tauriFsStore'

	constructor(
		protected baseDirectory?: string,
		protected dir = BaseDirectory.AppLocalData
	) {
		super()
	}

	serialize() {
		return <const>{
			type: this.type,
			baseDirectory: this.baseDirectory,
			dir: this.dir,
		}
	}
	static deserialize(data: ITauriFsSerializedData & { type: TStoreType }) {
		return new TauriFsStore(data.baseDirectory, data.dir)
	}

	async setup() {
		if (this.baseDirectory)
			await createDir(this.baseDirectory, { dir: this.dir }).catch(() => {
				// Ignore error if directory already exists
			})
	}

	resolvePath(path: string) {
		if (!this.baseDirectory) return path
		return join(this.baseDirectory, path)
	}

	async createDirectory(path: string) {
		await createDir(this.resolvePath(path), { dir: this.dir }).catch(() => {
			// Ignore error if directory already exists
		})
	}

	async getDirectoryEntries(path: string) {
		const entries = await readDir(this.resolvePath(path), { dir: this.dir })
		return <string[]>entries.map((entry) => entry.name)
	}

	async writeFile(path: string, data: Uint8Array) {
		await writeBinaryFile(this.resolvePath(path), data, { dir: this.dir })
	}

	async readFile(path: string) {
		return await readBinaryFile(this.resolvePath(path), { dir: this.dir })
	}

	async unlink(path: string) {
		const type = await this.typeOf(path)
		// Path does not exist, nothing to unlink
		if (type === null) return

		if (type === 'file') {
			await removeFile(this.resolvePath(path), { dir: this.dir })
		} else {
			await removeDir(this.resolvePath(path), { dir: this.dir })
		}
	}

	async typeOf(path: string) {
		try {
			await readDir(this.resolvePath(path), { dir: this.dir })
			return 'directory'
		} catch (err) {
			try {
				await readBinaryFile(this.resolvePath(path), { dir: this.dir })
				return 'file'
			} catch (err) {
				return null
			}
		}
	}
}
