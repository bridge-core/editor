import type { VirtualFolder } from './Folder'

export abstract class VirtualEntry {
	public abstract readonly kind: 'file' | 'directory'

	constructor(
		protected parent: VirtualFolder | null,
		protected _name: string
	) {}

	get name() {
		return this._name
	}
}
