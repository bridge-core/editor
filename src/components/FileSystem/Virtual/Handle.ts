import type { VirtualDirectoryHandle } from './DirectoryHandle'
import type { VirtualFileHandle } from './FileHandle'
import { v4 as v4Uuid } from 'uuid'
import { Signal } from '../../Common/Event/Signal'
import { BaseStore } from './Stores/BaseStore'
import { MemoryStore } from './Stores/Memory'
import { TauriFsStore } from './Stores/TauriFs'

export type VirtualHandle = VirtualDirectoryHandle | VirtualFileHandle

export abstract class BaseVirtualHandle {
	protected _baseStore: BaseStore | null = null
	protected parent: VirtualDirectoryHandle | null = null
	public readonly isVirtual = true
	public abstract readonly kind: 'directory' | 'file'
	public readonly setupDone = new Signal<void>()
	protected includeSelfInPath = true

	constructor(
		parent: VirtualDirectoryHandle | BaseStore | null,
		protected _name: string,
		protected basePath: string[] = []
	) {
		if (parent === null) {
			this._baseStore = new MemoryStore()
		} else if (parent instanceof BaseStore) {
			this._baseStore = parent
		} else {
			this.parent = parent
		}

		/**
		 * TauriFs should not include self in path for top-level directory handle
		 */ if (this._baseStore instanceof TauriFsStore) {
			this.includeSelfInPath = false
		}
	}

	async setupStore() {
		if (this._baseStore) await this._baseStore.setup()
	}
	getBaseStore() {
		return this.baseStore
	}

	protected get path(): string[] {
		return this.parent
			? [...this.parent.path.concat(this.name)]
			: [...this.basePath]
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
		if (this.path.length === 0)
			return this.includeSelfInPath ? this.name : ''
		return this.path.join('/')
	}
	protected get baseStore(): BaseStore {
		if (this._baseStore === null) {
			return this.parent!.baseStore
		}
		return this._baseStore
	}
	abstract removeSelf(): Promise<void>

	get name() {
		return this._name
	}
	abstract getParent(): VirtualDirectoryHandle | null
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
