import type { VirtualDirectoryHandle } from './DirectoryHandle'

export abstract class VirtualHandle {
	public abstract readonly kind: 'file' | 'directory'

	constructor(
		protected parent: VirtualDirectoryHandle | null,
		protected _name: string
	) {}

	protected get path(): string[] {
		return this.parent ? this.parent.path.concat(this.name) : []
	}

	get name() {
		return this._name
	}
	getParent() {
		return this.parent
	}

	isSameEntry(handle: VirtualHandle) {
		return handle === this
	}

	async queryPermission(_: FileSystemHandlePermissionDescriptor) {
		return 'granted'
	}
	async requestPermission(_: FileSystemHandlePermissionDescriptor) {
		return 'granted'
	}
}
