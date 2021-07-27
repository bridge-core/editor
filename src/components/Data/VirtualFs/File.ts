import { VirtualEntry } from './Entry'
import type { VirtualFolder } from './Folder'

/**
 * A class that implements a virtual file
 */
export class VirtualFile extends VirtualEntry {
	public readonly kind = 'file'

	constructor(
		parent: VirtualFolder | null,
		name: string,
		protected data: Uint8Array
	) {
		super(parent, name)
	}

	async text() {
		return new TextDecoder('utf-8').decode(this.data)
	}
	async arrayBuffer() {
		return this.data.buffer
	}
}
