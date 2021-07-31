import { AnyHandle } from '../Types'
import type { VirtualDirectoryHandle } from './DirectoryHandle'
import type { VirtualFileHandle } from './FileHandle'

export type VirtualHandle = VirtualDirectoryHandle | VirtualFileHandle
export abstract class BaseVirtualHandle {
	public abstract readonly kind: FileSystemHandleKind
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
	abstract serialize(): unknown

	async isSameEntry(other: BaseVirtualHandle | AnyHandle) {
		return other === this
	}

	async queryPermission(
		_: FileSystemHandlePermissionDescriptor
	): Promise<PermissionState> {
		return 'granted'
	}
	async requestPermission(
		_: FileSystemHandlePermissionDescriptor
	): Promise<PermissionState> {
		return 'granted'
	}
}
