import { VirtualHandle, BaseVirtualHandle } from './Handle'
import { VirtualFileHandle } from './FileHandle'
import { ISerializedDirectoryHandle } from './Comlink'
import { BaseStore } from './Stores/BaseStore'
import { IndexedDbStore } from './Stores/IndexedDb'
import { MemoryStore } from './Stores/Memory'
import { deserializeStore } from './Stores/Deserialize'
import { TauriFsStore } from './Stores/TauriFs'

/**
 * A class that implements a virtual folder
 */
export class VirtualDirectoryHandle extends BaseVirtualHandle {
	public readonly kind = 'directory'
	/**
	 * @depracted
	 */
	public readonly isDirectory = true
	/**
	 * @depracted
	 */
	public readonly isFile = false

	async moveToIdb() {
		if (!this._baseStore)
			throw new Error(`Must call method on top-level directory`)
		if (!(this._baseStore instanceof MemoryStore))
			throw new Error(`Must call method on memory store`)

		this._baseStore = await this._baseStore.toIdb()
	}

	constructor(
		parent: VirtualDirectoryHandle | BaseStore | null,
		name: string,
		clearDB = false,
		path: string[] = []
	) {
		super(parent, name, path)

		this.setup(clearDB)
	}

	async setup(clearDB = false) {
		await this.setupStore()

		if (clearDB) {
			if (!(this.baseStore instanceof IndexedDbStore))
				throw new Error('Cannot clear DB for non-IDB store')

			await this.baseStore.clear()
		}

		/**
		 * TauriFsStore should not create the base directory because that'll lead to duplicated directories
		 */
		if (this.idbKey !== '')
			await this.baseStore.createDirectory(this.idbKey)

		this.setupDone.dispatch()
	}

	protected async fromStore() {
		return (await this.baseStore.getDirectoryEntries(this.idbKey)) ?? []
	}

	protected async getChildren() {
		return <VirtualHandle[]>(
			(
				await Promise.all(
					(await this.fromStore()).map((name) => this.getChild(name))
				)
			).filter((child) => child !== undefined)
		)
	}
	protected getChildPath(childName: string) {
		return this.path.concat(childName).join('/')
	}
	protected async getChild(childName: string) {
		const type = await this.baseStore.typeOf(this.getChildPath(childName))

		if (type === 'file') {
			return new VirtualFileHandle(this, childName)
		} else if (type === 'directory') {
			return new VirtualDirectoryHandle(this, childName)
		} else if (type === null) {
			return undefined
		} else {
			throw new Error(`Unknown type ${type}`)
		}
	}

	protected async hasChildren() {
		return (await this.fromStore()).length > 0
	}
	protected async has(childName: string) {
		return (await this.fromStore()).includes(childName)
	}
	serialize(): ISerializedDirectoryHandle {
		let baseStore: BaseStore | undefined = undefined
		if (this.baseStore) baseStore = this.baseStore.serialize()

		return {
			baseStore,
			kind: 'directory',
			name: this.name,
			path: this.path,
		}
	}
	static deserialize(data: ISerializedDirectoryHandle) {
		let baseStore: BaseStore | null = null

		if (data.baseStore) baseStore = deserializeStore(data.baseStore)

		const dir = new VirtualDirectoryHandle(
			baseStore,
			data.name,
			false,
			data.path
		)

		return dir
	}

	async getDirectoryHandle(
		name: string,
		{ create }: { create?: boolean } = {}
	) {
		let entry = await this.getChild(name)

		if (entry && entry.kind === 'file') {
			throw new Error(
				`TypeMismatch: Expected directory with name "${name}", found file`
			)
		} else if (!entry) {
			if (create) {
				entry = new VirtualDirectoryHandle(this, name)
				await entry.setupDone.fired
			} else {
				throw new Error(
					`No directory with the name "${name}" exists in this folder`
				)
			}
		}

		return <VirtualDirectoryHandle>entry
	}
	async getFileHandle(
		name: string,
		{
			create,
			initialData,
		}: { create?: boolean; initialData?: Uint8Array } = {}
	) {
		let entry = await this.getChild(name)

		if (entry && entry.kind === 'directory') {
			throw new Error(
				`TypeMismatch: Expected file with name "${name}", found directory`
			)
		} else if (!entry) {
			if (create) {
				entry = new VirtualFileHandle(
					this,
					name,
					initialData ?? new Uint8Array()
				)
				await entry.setupDone.fired
			} else {
				throw new Error(
					`No file with the name "${name}" exists in this folder`
				)
			}
		}

		return <VirtualFileHandle>entry
	}
	async removeEntry(
		name: string,
		{ recursive }: { recursive?: boolean } = {}
	) {
		const entry = await this.getChild(name)

		if (!entry) {
			throw new Error(
				`No entry with the name "${name}" exists in this folder`
			)
		} else if (
			entry.kind === 'directory' &&
			!recursive &&
			(await (<VirtualDirectoryHandle>entry).hasChildren())
		) {
			throw new Error(
				`Cannot remove directory with children without "recursive" option being set to true`
			)
		}

		await entry.removeSelf()
	}
	async resolve(possibleDescendant: VirtualHandle) {
		const path: string[] = [possibleDescendant.name]

		let current = possibleDescendant.getParent()
		while (current !== null && !(await current.isSameEntry(this))) {
			path.unshift(current.name)
			current = current.getParent()
		}

		if (current === null) return null
		return path
	}
	async removeSelf() {
		const children = await this.getChildren()

		for (const child of children) {
			await child.removeSelf()
		}

		await this.baseStore.unlink(this.idbKey)
	}

	[Symbol.asyncIterator]() {
		return this.entries()
	}

	keys() {
		return {
			childNamesPromise: this.fromStore(),

			[Symbol.asyncIterator]() {
				return <
					AsyncIterableIterator<string> & {
						i: number
						childNamesPromise: Promise<string[]>
					}
				>{
					i: 0,
					childNamesPromise: this.childNamesPromise,

					async next() {
						const childNames = await this.childNamesPromise

						if (this.i < childNames.length)
							return {
								done: false,
								value: childNames[this.i++],
							}
						else return { done: true }
					},
				}
			},
		}
	}
	entries() {
		return {
			childrenPromise: this.getChildren(),

			[Symbol.asyncIterator]() {
				return <
					AsyncIterableIterator<[string, VirtualHandle]> & {
						i: number
						childrenPromise: Promise<VirtualHandle[]>
					}
				>{
					i: 0,
					childrenPromise: this.childrenPromise,

					async next() {
						const children = await this.childrenPromise

						if (this.i < children.length)
							return {
								done: false,
								value: [
									children[this.i].name,
									children[this.i++],
								],
							}
						else return { done: true }
					},
				}
			},
		}
	}
	values() {
		return {
			childrenPromise: this.getChildren(),

			[Symbol.asyncIterator]() {
				return <
					AsyncIterableIterator<VirtualHandle> & {
						i: number
						childrenPromise: Promise<VirtualHandle[]>
					}
				>{
					i: 0,
					childrenPromise: this.childrenPromise,

					async next() {
						const children = await this.childrenPromise

						if (this.i < children.length)
							return {
								done: false,
								value: children[this.i++],
							}
						else return { done: true }
					},
				}
			},
		}
	}

	/**
	 * @deprecated
	 */
	getEntries() {
		return this.values()
	}
	/**
	 * @deprecated
	 */
	getDirectory(name: string, opts: { create?: boolean } = {}) {
		return this.getDirectoryHandle(name, opts)
	}
	/**
	 * @deprecated
	 */
	getFile(name: string, opts: { create?: boolean } = {}) {
		return this.getFileHandle(name, opts)
	}
}
