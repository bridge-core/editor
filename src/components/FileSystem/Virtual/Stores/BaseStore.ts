export interface IFileData {
	lastModified: number
	data: Uint8Array
}

/**
 * Base implementation of a file system backing store that can be used by our file system access polyfill
 */
export abstract class BaseStore {
	/**
	 * Any async setup that needs to be done before the store can be used
	 */
	async setup() {}

	/**
	 * Create directory
	 */
	abstract createDirectory(path: string): Promise<void>

	/**
	 * Get directory entries
	 */
	abstract getDirectoryEntries(path: string): Promise<string[]>

	/**
	 * Write file
	 */
	abstract writeFile(path: string, data: Uint8Array): Promise<void>

	/**
	 * Read file
	 */
	abstract readFile(path: string): Promise<Uint8Array>

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
