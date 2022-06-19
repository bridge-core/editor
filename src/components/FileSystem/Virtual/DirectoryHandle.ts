import { VirtualHandle, BaseVirtualHandle } from './Handle'
import { VirtualFileHandle } from './FileHandle'
import { ISerializedDirectoryHandle } from './Comlink'
import { clear, get, set, del, keys } from './IDB'

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
		if (!this.children)
			throw new Error(
				`No directory data to move to IDB for directory "${this.name}"`
			)

		await set(this.idbKey, [...this.children.keys()])
		this.children = undefined
	}

	constructor(
		parent: VirtualDirectoryHandle | null,
		name: string,
		protected children?: Map<string, VirtualHandle> | undefined,
		clearDB = false,
		path: string[] = []
	) {
		super(parent, name, path)

		this.updateIdb(clearDB)
	}

	async updateIdb(deleteOld = false) {
		if (deleteOld) {
			const paths = await keys()

			for (const path of paths) {
				if (
					typeof path === 'string' &&
					path.startsWith('data/packages/')
				)
					await del(path)
			}
		}

		if (!this.children && !(await this.hasChildren()))
			await set(this.idbKey, [])

		this.setupDone.dispatch()
	}

	protected async addChild(child: VirtualHandle) {
		if (await this.has(child.name)) {
			return
		}

		if (this.children) this.children.set(child.name, child)
		else await set(this.idbKey, [...(await this.fromIdb()), child.name])
	}
	protected async fromIdb() {
		return (await get<string[]>(this.idbKey)) ?? []
	}

	protected async getChildren() {
		if (this.children) return [...this.children.values()]
		else
			return <VirtualHandle[]>(
				await Promise.all(
					(await this.fromIdb())
						.map((name) => this.getChild(name))
						.filter((child) => child !== undefined)
				)
			)
	}
	protected getChildPath(childName: string) {
		return this.path.concat(childName).join('/')
	}
	protected async getChild(childName: string) {
		if (this.children) return this.children.get(childName)

		if (await this.has(childName)) {
			const data = await get(this.getChildPath(childName))

			if (data instanceof Uint8Array) {
				return new VirtualFileHandle(this, childName)
			} else if (Array.isArray(data)) {
				return new VirtualDirectoryHandle(this, childName)
			} else {
				// File/folder was deleted
			}
		}
	}

	async deleteChild(childName: string) {
		if (this.children) this.children.delete(childName)
		else
			await set(
				this.idbKey,
				(await this.fromIdb()).filter((name) => name !== childName)
			)
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
			parent,
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
		let entry = await this.getChild(name)

		if (entry && entry.kind === 'file') {
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
				throw new Error(
					`No file with the name ${name} exists in this folder`
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

				await this.addChild(entry)
			} else {
				throw new Error(
					`No file with the name ${name} exists in this folder`
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
				`No entry with the name ${name} exists in this folder`
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

		await this.deleteChild(name)
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
	async removeSelf(isFirst = true) {
		const children = await this.getChildren()

		for (const child of children) {
			await child.removeSelf(false)
		}

		if (!this.children) await del(this.idbKey)
		if (this.parent && isFirst) this.parent.deleteChild(this.name)
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
