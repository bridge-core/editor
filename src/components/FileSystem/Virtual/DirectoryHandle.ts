import { VirtualHandle, BaseVirtualHandle } from './Handle'
import { VirtualFileHandle } from './FileHandle'
import { ISerializedDirectoryHandle } from './Comlink'
import { IDBWrapper } from './IDB'
import { GlobalMutex } from '/@/components/Common/GlobalMutex'

const globalMutex = new GlobalMutex()

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

	get isDirectoryInMemory() {
		return this.children !== undefined
	}
	async moveToIdb() {
		const children = this.allInMemoryChildren()

		this.idbWrapper.setMany(
			children.map((child) => [child.idbKey, child.moveData()])
		)
	}
	moveData() {
		if (!this.children)
			throw new Error(
				`No directory data to move to IDB for directory "${this.name}"`
			)

		const children = [...this.children.values()].map((child) => child.name)
		this.children = undefined

		return children
	}
	protected allInMemoryChildren() {
		if (!this.children) return []

		// Recursively get all in memory children
		const children: BaseVirtualHandle[] = [this]

		for (const child of this.children.values()) {
			if (child instanceof VirtualDirectoryHandle) {
				if (child.isDirectoryInMemory)
					children.push(...child.allInMemoryChildren())
			} else {
				if (child.isFileStoredInMemory) children.push(child)
			}
		}

		return children
	}

	constructor(
		parent: VirtualDirectoryHandle | IDBWrapper | null,
		name: string,
		protected children?: Map<string, VirtualHandle> | undefined,
		clearDB = false,
		path: string[] = []
	) {
		super(parent, name, path)

		this.updateIdb(clearDB)
	}
	/**
	 * Acquire exclusive access to this directory
	 */
	async lockAccess() {
		await globalMutex.lock(this.idbKey)
	}
	/**
	 * Release exclusive access to this directory
	 */
	unlockAccess() {
		globalMutex.unlock(this.idbKey)
	}

	async updateIdb(clearDB = false) {
		await this.lockAccess()
		if (clearDB) {
			await this.idbWrapper.clear()
		}

		if (!this.children && !(await this.hasChildren()))
			await this.idbWrapper.set(this.idbKey, [])

		this.setupDone.dispatch()
		this.unlockAccess()
	}

	protected async addChild(child: VirtualHandle) {
		if (this.children) this.children.set(child.name, child)
		else
			await this.idbWrapper.set(this.idbKey, [
				...new Set([...(await this.fromIdb()), child.name]),
			])
	}
	protected async fromIdb() {
		return (await this.idbWrapper.get<string[]>(this.idbKey)) ?? []
	}

	protected async getChildren() {
		if (this.children) return [...this.children.values()]
		else
			return <VirtualHandle[]>(
				(
					await Promise.all(
						(
							await this.fromIdb()
						).map((name) => this.getChild(name))
					)
				).filter((child) => child !== undefined)
			)
	}
	protected getChildPath(childName: string) {
		return this.path.concat(childName).join('/')
	}
	protected async getChild(childName: string) {
		if (this.children) return this.children.get(childName)

		if (await this.has(childName)) {
			const data = await this.idbWrapper.get(this.getChildPath(childName))

			if (data instanceof Uint8Array) {
				return new VirtualFileHandle(this, childName)
			} else if (Array.isArray(data)) {
				return new VirtualDirectoryHandle(this, childName)
			} else {
				// File/folder was deleted
			}
		}
	}

	/**
	 * @deprecated THIS IS NOT A PUBLIC API
	 *
	 * @param childName
	 * @param lockMutex
	 */
	async deleteChild(childName: string, lockMutex = true) {
		if (lockMutex) await this.lockAccess()

		if (this.children) this.children.delete(childName)
		else
			await this.idbWrapper.set(
				this.idbKey,
				(await this.fromIdb()).filter((name) => name !== childName)
			)

		if (lockMutex) this.unlockAccess()
	}

	protected async hasChildren() {
		if (this.children) return this.children.size > 0
		else return (await this.fromIdb()).length > 0
	}
	protected async has(childName: string) {
		if (this.children) return this.children.has(childName)
		else return (await this.fromIdb()).includes(childName)
	}
	serialize(): ISerializedDirectoryHandle {
		return {
			idbWrapper: this.idbWrapper.storeName,
			kind: 'directory',
			name: this.name,
			path: this.path,
			children: this.children
				? [...this.children.values()].map((child: VirtualHandle) =>
						child.serialize()
				  )
				: undefined,
		}
	}
	static deserialize(
		data: ISerializedDirectoryHandle,
		parent: VirtualDirectoryHandle | null = null
	) {
		const dir = new VirtualDirectoryHandle(
			!parent ? new IDBWrapper(data.idbWrapper) : parent,
			data.name,
			undefined,
			false,
			data.path
		)

		for (const child of data.children ?? []) {
			if (child.kind === 'directory')
				dir.addChild(VirtualDirectoryHandle.deserialize(child, dir))
			else
				dir.addChild(
					new VirtualFileHandle(dir, child.name, child.fileData)
				)
		}

		return dir
	}

	async getDirectoryHandle(
		name: string,
		{ create }: { create?: boolean } = {}
	) {
		await this.lockAccess()

		let entry = await this.getChild(name)

		if (entry && entry.kind === 'file') {
			this.unlockAccess()
			throw new Error(
				`TypeMismatch: Expected directory with name "${name}", found file`
			)
		} else if (!entry) {
			if (create) {
				entry = new VirtualDirectoryHandle(
					this,
					name,
					this.children ? new Map() : undefined
				)
				await entry.setupDone.fired

				await this.addChild(entry)
			} else {
				this.unlockAccess()
				throw new Error(
					`No file with the name ${name} exists in this folder`
				)
			}
		}

		this.unlockAccess()

		return <VirtualDirectoryHandle>entry
	}
	async getFileHandle(
		name: string,
		{
			create,
			initialData,
		}: { create?: boolean; initialData?: Uint8Array } = {}
	) {
		await this.lockAccess()
		let entry = await this.getChild(name)

		if (entry && entry.kind === 'directory') {
			this.unlockAccess()
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

				await this.addChild(entry)
			} else {
				this.unlockAccess()
				throw new Error(
					`No file with the name ${name} exists in this folder`
				)
			}
		}

		this.unlockAccess()

		return <VirtualFileHandle>entry
	}
	async removeEntry(
		name: string,
		{ recursive }: { recursive?: boolean } = {}
	) {
		await this.lockAccess()

		const entry = await this.getChild(name)

		if (!entry) {
			this.unlockAccess()
			throw new Error(
				`No entry with the name ${name} exists in this folder`
			)
		} else if (
			entry.kind === 'directory' &&
			!recursive &&
			(await (<VirtualDirectoryHandle>entry).hasChildren())
		) {
			this.unlockAccess()
			throw new Error(
				`Cannot remove directory with children without "recursive" option being set to true`
			)
		}

		await entry.removeSelf(true, false)

		await this.deleteChild(name, false)
		this.unlockAccess()
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
	async removeSelf(isFirst = true, lockMutex = true) {
		if (lockMutex) await this.lockAccess()

		const children = await this.getChildren()

		for (const child of children) {
			await child.removeSelf(false)
		}

		if (!this.children) await this.idbWrapper.del(this.idbKey)
		if (this.parent && isFirst) this.parent.deleteChild(this.name)

		if (lockMutex) this.unlockAccess()
	}

	[Symbol.asyncIterator]() {
		return this.entries()
	}

	keys() {
		if (this.children) return this.children.keys()

		return {
			childNamesPromise: this.fromIdb(),

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
		if (this.children) return this.children.entries()

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
		if (this.children) return this.children.values()

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
