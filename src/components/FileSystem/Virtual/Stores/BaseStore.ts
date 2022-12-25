export const FsKindEnum = <const>{
	Directory: 0,
	File: 1,
}
export type TFsKind = typeof FsKindEnum['Directory' | 'File']
export interface IFsEntry<T> {
	kind: TFsKind
	data: T
}
export interface IFileData extends IFsEntry<Uint8Array> {
	kind: typeof FsKindEnum.File
	lastModified: number
}
export interface IDirectoryData extends IFsEntry<IDirEntry[]> {
	kind: typeof FsKindEnum.Directory
}
export interface IDirEntry {
	kind: TFsKind
	name: string
}

export type TStoreType = 'idbStore' | 'memoryStore' | 'tauriFsStore'

/**
 * Base implementation of a file system backing store that can be used by our file system access polyfill
 */
export abstract class BaseStore<T = any> {
	public abstract readonly type: TStoreType

	constructor(protected isReadOnly = false) {}

	/**
	 * Any async setup that needs to be done before the store can be used
	 */
	async setup() {}

	abstract serialize(): T & { type: TStoreType }
	static deserialize(data: any & { type: TStoreType }): BaseStore {
		throw new Error('BaseStore deserialization not implemented')
	}

	/**
	 * Create directory
	 */
	abstract createDirectory(path: string): Promise<void>

	/**
	 * Get directory entries
	 */
	abstract getDirectoryEntries(path: string): Promise<(IDirEntry | string)[]>

	/**
	 * Write file
	 */
	abstract writeFile(path: string, data: Uint8Array): Promise<void>

	/**
	 * Read file
	 */
	abstract readFile(path: string): Promise<File>

	/**
	 * Return when a file was last modified and its size
	 *
	 * @returns [size, lastModified]
	 */
	metadata(path: string) {
		return this.readFile(path).then(
			(file) => <const>[file.size, file.lastModified, file.type]
		)
	}
	/**
	 * Return the content of a file as a Uint8Array
	 */
	read(path: string) {
		return this.readFile(path)
			.then((file) => file.arrayBuffer())
			.then((buffer) => new Uint8Array(buffer))
	}

	/**
	 * Unlink a file or directory
	 */
	abstract unlink(path: string): Promise<void>

	/**
	 * Return the type of a given path
	 * @returns null if the path does not exist
	 */
	abstract typeOf(path: string): Promise<null | 'file' | 'directory'>
}
