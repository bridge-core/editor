import { AnyHandle } from '../Types'
import type { VirtualDirectoryHandle } from './DirectoryHandle'
import type { VirtualFileHandle } from './FileHandle'
import { v4 as v4Uuid } from 'uuid'

export type VirtualHandle = VirtualDirectoryHandle | VirtualFileHandle

export abstract class BaseVirtualHandle {
	public abstract readonly kind: FileSystemHandleKind

	constructor(
		protected parent: VirtualDirectoryHandle | null,
		protected _name: string,
		public readonly uuid = v4Uuid()
	) {}

	protected get path(): string[] {
		return this.parent ? this.parent.path.concat(this.name) : []
	}
	protected get idbKey() {
		return this.path.join('/')
	}
	abstract removeSelf(): Promise<void>

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
