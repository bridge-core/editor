import type { VirtualDirectoryHandle } from './DirectoryHandle'

export abstract class VirtualHandle {
	public abstract readonly kind: 'file' | 'directory'

	constructor(
		protected parent: VirtualDirectoryHandle | null,
		protected _name: string
	) {}

	get name() {
		return this._name
	}
}
