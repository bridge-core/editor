import { BaseVirtualHandle } from './Handle'
import type { VirtualDirectoryHandle } from './DirectoryHandle'
import { VirtualWritable, writeMethodSymbol } from './VirtualWritable'
import { ISerializedFileHandle } from './Comlink'

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
		parent: VirtualDirectoryHandle | null,
		name: string,
		protected data: Uint8Array
	) {
		super(parent, name)
	}

	serialize(): ISerializedFileHandle {
		return {
			kind: 'file',
			name: this.name,
			data: this.data,
		}
	}
	async getFile() {
		return new File([this.data], this.name)
	}
	async createWritable() {
		return new VirtualWritable(this)
	}
	[writeMethodSymbol](data: Uint8Array) {
		this.data = data
	}
}
