import { VirtualHandle } from './Handle'
import type { VirtualDirectoryHandle } from './DirectoryHandle'
import { VirtualWritable, writeMethodSymbol } from './VirtualWritable'

/**
 * A class that implements a virtual file
 */
export class VirtualFileHandle extends VirtualHandle {
	public readonly kind = 'file'

	constructor(
		parent: VirtualDirectoryHandle | null,
		name: string,
		protected data: Uint8Array
	) {
		super(parent, name)
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

	async text() {
		return new TextDecoder('utf-8').decode(this.data)
	}
	async arrayBuffer() {
		return this.data.buffer
	}
}
