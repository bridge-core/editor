import type { VirtualDirectoryHandle } from './DirectoryHandle'
import type { VirtualFileHandle } from './FileHandle'
import { v4 as v4Uuid } from 'uuid'
import { Signal } from '../../Common/Event/Signal'

export type VirtualHandle = VirtualDirectoryHandle | VirtualFileHandle

export abstract class BaseVirtualHandle {
	public readonly isVirtual = true
	public abstract readonly kind: 'directory' | 'file'
	public readonly setupDone = new Signal<void>()

	constructor(
		protected parent: VirtualDirectoryHandle | null,
		protected _name: string,
		protected basePath: string[] = [],
		public readonly uuid = v4Uuid()
	) {}

	protected get path(): string[] {
		return this.parent ? this.parent.path.concat(this.name) : this.basePath
	}
	protected get idbKey() {
		if (this.path.length === 0) return this._name
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

	async isSameEntry(other: BaseVirtualHandle) {
		return other.idbKey === this.idbKey
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
