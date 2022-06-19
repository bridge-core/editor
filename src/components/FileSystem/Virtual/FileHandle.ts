import { BaseVirtualHandle } from './Handle'
import type { VirtualDirectoryHandle } from './DirectoryHandle'
import { VirtualWritable, writeMethodSymbol } from './VirtualWritable'
import { ISerializedFileHandle } from './Comlink'
import { get, set, del } from './IDB'
import { markRaw } from '@vue/composition-api'

/**
 * A class that implements a virtual file
 */
export class VirtualFileHandle extends BaseVirtualHandle {
	public readonly kind = 'file'
	/**
	 * @depracted
	 */
	public readonly isFile = true
	/**
	 * @depracted
	 */
	public readonly isDirectory = false

	protected fileData?: Uint8Array

	get isFileStoredInMemory() {
		return this.fileData !== undefined
	}
	async moveToIdb() {
		if (!this.fileData)
			throw new Error(
				`No file data to move to IDB for file "${this.name}"`
			)

		this.inMemory = false
		await this.updateIdb(this.fileData)
	}

	constructor(
		parent: VirtualDirectoryHandle | null,
		name: string,
		data?: Uint8Array,
		protected inMemory = false
	) {
		super(parent, name)
		if (data) this.setup(data)
		else this.setupDone.dispatch()
	}
	protected async setup(fileData: Uint8Array) {
		// Composition API isn't available within web workers (and usage of markRaw isn't necessary there) so we can omit the markRaw call
		this.fileData = globalThis.document ? markRaw(fileData) : fileData

		const isDataFile = this.path.join('/').startsWith('data/packages')

		// This prevents an IndexedDB overload by saving too many small data files to the DB
		if (this.inMemory || (isDataFile && fileData.length < 10_000)) {
			this.inMemory = true
			return this.setupDone.dispatch()
		}

		// We only need to write data files from the main thread, web workers can just load the already written data from the main thread
		if (!isDataFile || globalThis.document) await this.updateIdb(fileData)
		this.setupDone.dispatch()
	}

	protected async updateIdb(data: Uint8Array) {
		await set(this.idbKey, data)
		this.fileData = undefined
	}

	protected async loadFromIdb() {
		if (this.fileData) return this.fileData

		let storedData = await get(this.idbKey)
		if (storedData === undefined) {
			console.log(this.parent)
			throw new Error(`File not found: "${this.path.join('/')}"`)
		}

		return storedData!
	}
	serialize(): ISerializedFileHandle {
		return {
			kind: 'file',
			name: this.name,
			fileData: this.fileData,
		}
	}

	async removeSelf(isFirst = true) {
		await del(this.idbKey)
		if (this.parent && isFirst) this.parent.deleteChild(this.name)
	}

	async getFile() {
		const fileData = await this.loadFromIdb()
		// console.log(this.path.join('/'), this.fileData, fileData)

		return new File([fileData], this.name)
	}
	async createWritable() {
		return new VirtualWritable(this)
	}
	async [writeMethodSymbol](data: Uint8Array) {
		if (this.inMemory) this.fileData = data
		else await this.updateIdb(data)
	}
}
