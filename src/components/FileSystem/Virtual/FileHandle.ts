import { BaseVirtualHandle } from './Handle'
import type { VirtualDirectoryHandle } from './DirectoryHandle'
import { VirtualWritable, writeMethodSymbol } from './VirtualWritable'
import { ISerializedFileHandle } from './Comlink'
import { BaseStore } from './Stores/BaseStore'
import { deserializeStore } from './Stores/Deserialize'
import { IndexedDbStore } from './Stores/IndexedDb'

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

	constructor(
		parent: VirtualDirectoryHandle | BaseStore | null,
		name: string,
		data?: Uint8Array,
		path?: string[]
	) {
		super(parent, name, path)

		this.setup(data)
	}
	protected async setup(fileData?: Uint8Array) {
		await this.setupStore()

		// We only need to write data files from the main thread, web workers can just load the already written data from the main thread
		if (!globalThis.document && this.baseStore instanceof IndexedDbStore) {
			this.setupDone.dispatch()
			return
		}

		if (fileData) await this.baseStore.writeFile(this.idbKey, fileData)

		this.setupDone.dispatch()
	}

	serialize(): ISerializedFileHandle {
		let baseStore: BaseStore | undefined = undefined
		if (this.baseStore) baseStore = this.baseStore.serialize()

		return {
			baseStore,
			kind: 'file',
			name: this.name,
			path: this.path,
		}
	}
	static deserialize(data: ISerializedFileHandle) {
		let baseStore: BaseStore | null = null
		if (data.baseStore) baseStore = deserializeStore(data.baseStore)

		return new VirtualFileHandle(
			baseStore,
			data.name,
			data.fileData,
			data.path
		)
	}

	override async isSameEntry(other: BaseVirtualHandle): Promise<boolean> {
		if (this.parent === null) return false

		return super.isSameEntry(other)
	}

	async removeSelf() {
		await this.baseStore.unlink(this.idbKey)
	}

	async getFile() {
		const fileData = await this.baseStore.readFile(this.idbKey)
		// console.log(this.path.join('/'), this.fileData, fileData)

		// TODO: Support lastModified timestamp so lightning cache can make use of its optimizations
		return new File([fileData], this.name)
	}
	async createWritable() {
		return new VirtualWritable(this)
	}
	async [writeMethodSymbol](data: Uint8Array) {
		await this.baseStore.writeFile(this.idbKey, data)
	}
}
