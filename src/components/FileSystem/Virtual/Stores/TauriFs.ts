import {
	createDir,
	readDir,
	writeBinaryFile,
	readBinaryFile,
	removeDir,
	removeFile,
} from '@tauri-apps/api/fs'
import { isAbsolute, join, sep } from '@tauri-apps/api/path'
import { invoke } from '@tauri-apps/api/tauri'
import { VirtualFile } from '../File'
import { BaseStore, FsKindEnum, type TStoreType } from './BaseStore'

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
		if (this.isReadOnly) return

		if (this.baseDirectory)
			await createDir(this.baseDirectory, { recursive: true }).catch(
				() => {
					// Ignore error if directory already exists
				}
			)
	}

	async resolvePath(path: string) {
		path = path.replaceAll(/\\|\//g, sep)
		if (!this.baseDirectory) return path
		if (await isAbsolute(path)) return path
		return await join(this.baseDirectory, path)
	}

	async createDirectory(path: string) {
		if (this.isReadOnly) return

		await createDir(await this.resolvePath(path)).catch(() => {
			// Ignore error if directory already exists
		})
	}

	async getDirectoryEntries(path: string) {
		const entries = await readDir(await this.resolvePath(path))

		return entries.map((entry) => ({
			kind: entry.children ? FsKindEnum.Directory : FsKindEnum.File,
			name: entry.name!,
		}))
	}

	async writeFile(path: string, data: Uint8Array) {
		if (this.isReadOnly) return

		await writeBinaryFile(await this.resolvePath(path), data)
	}

	async readFile(path: string): Promise<File | VirtualFile> {
		return await VirtualFile.for(this, path)
	}

	async metadata(path: string) {
		return await invoke<readonly [number, number, string]>(
			'get_file_metadata',
			{
				path: await this.resolvePath(path),
			}
		)
	}

	async read(path: string) {
		const rawArray = await invoke<Array<number>>('read_file', {
			path: await this.resolvePath(path),
		})

		return new Uint8Array(rawArray)
	}

	async unlink(path: string) {
		if (this.isReadOnly) return

		const type = await this.typeOf(path)
		// Path does not exist, nothing to unlink
		if (type === null) return

		if (type === 'file') {
			await removeFile(await this.resolvePath(path))
		} else {
			await removeDir(await this.resolvePath(path))
		}
	}

	async typeOf(path: string) {
		const resolvedPath = await this.resolvePath(path)

		try {
			await readBinaryFile(resolvedPath)
			return 'file'
		} catch (err) {
			try {
				await readDir(resolvedPath)
				return 'directory'
			} catch (err) {
				return null
			}
		}
	}
}
