import type { VirtualDirectoryHandle } from './DirectoryHandle'
import type { VirtualFileHandle } from './FileHandle'
import { v4 as v4Uuid } from 'uuid'
import { Signal } from '../../Common/Event/Signal'
import { IDBWrapper } from './IDB'

export type VirtualHandle = VirtualDirectoryHandle | VirtualFileHandle

export abstract class BaseVirtualHandle {
	protected _idbWrapper: IDBWrapper | null = null
	protected parent: VirtualDirectoryHandle | null = null
	public readonly isVirtual = true
	public abstract readonly kind: 'directory' | 'file'
	public readonly setupDone = new Signal<void>()

	abstract moveData(): any

	constructor(
		parent: VirtualDirectoryHandle | IDBWrapper | null,
		protected _name: string,
		protected basePath: string[] = [],
		public readonly uuid = v4Uuid()
	) {
		if (parent === null) {
			this._idbWrapper = new IDBWrapper()
		} else if (parent instanceof IDBWrapper) {
			this._idbWrapper = parent
		} else {
			this.parent = parent
		}
	}

	protected get path(): string[] {
		return this.parent ? this.parent.path.concat(this.name) : this.basePath
	}
	/**
	 * Returns whether a handle has parent context
	 *
	 * e.g. whether a FileHandle is backed by an IDB entry
	 */
	get hasParentContext() {
		return this.path.length > 1
	}
	get idbKey() {
		if (this.path.length === 0) return this._name
		return this.path.join('/')
	}
	protected get idbWrapper(): IDBWrapper {
		if (this._idbWrapper === null) {
			return this.parent!.idbWrapper
		}
		return this._idbWrapper
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
