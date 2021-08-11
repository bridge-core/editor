import { BaseVirtualHandle } from './Handle'
import type { VirtualDirectoryHandle } from './DirectoryHandle'
import { VirtualWritable, writeMethodSymbol } from './VirtualWritable'
import { ISerializedFileHandle } from './Comlink'
import { get, set, has, del, getMany } from './IDB'
import { whenIdleDisposable } from '/@/utils/whenIdle'
import { IDisposable } from '/@/types/disposable'
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
	protected disposable?: IDisposable

	constructor(
		parent: VirtualDirectoryHandle | null,
		name: string,
		data?: Uint8Array
	) {
		super(parent, name)
		if (data) this.setup(data)
	}
	protected setup(fileData: Uint8Array) {
		// Composition API isn't available within web workers (and usage of markRaw isn't necessary there) so we can omit the markRaw call
		this.fileData = globalThis.document ? markRaw(fileData) : fileData

		// This prevents an IndexedDB overload by saving too many small data files to the DB
		if (
			this.path.join('/').startsWith('data/packages') &&
			fileData.length < 10_000
		)
			return

		this.disposable?.dispose?.()

		this.disposable = whenIdleDisposable(() => {
			this.updateIdb(fileData)
		})
	}

	protected async updateIdb(data: Uint8Array) {
		this.disposable?.dispose?.()

		await set(this.idbKey, data)
		this.fileData = undefined
	}

	protected async loadFromIdb() {
		if (this.fileData) return this.fileData

		let storedData = await get(this.idbKey)
		if (!storedData)
			throw new Error(`File not found: "${this.path.join('/')}"`)

		return storedData!
	}
	serialize() {
		return <const>{
			kind: 'file',
			name: this.name,
			data: new Uint8Array(),
		}
	}

	async removeSelf() {
		this.disposable?.dispose?.()
		await del(this.idbKey)
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
		await this.updateIdb(data)
	}
}
