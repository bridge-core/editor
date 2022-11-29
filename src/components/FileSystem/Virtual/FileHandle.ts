import { BaseVirtualHandle } from './Handle'
import type { VirtualDirectoryHandle } from './DirectoryHandle'
import { VirtualWritable, writeMethodSymbol } from './VirtualWritable'
import { ISerializedFileHandle } from './Comlink'
import { BaseStore } from './Stores/BaseStore'

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

		if (data) this.setup(data)
		else this.setupDone.dispatch()
	}
	protected async setup(fileData: Uint8Array) {
		await this.setupStore()

		// We only need to write data files from the main thread, web workers can just load the already written data from the main thread
		if (!globalThis.document) return

		await this.baseStore.writeFile(this.idbKey, fileData)

		this.setupDone.dispatch()
	}

	serialize(): ISerializedFileHandle {
		return {
			// TODO: Serialize base store
			// idbWrapper: this.idbWrapper.storeName,
			kind: 'file',
			name: this.name,
			path: this.path,
		}
	}
	static deserialize(data: ISerializedFileHandle) {
		return new VirtualFileHandle(
			// TODO: Deserialize base store
			// data.idbWrapper ? new IDBWrapper(data.idbWrapper) : null,
			null,
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
