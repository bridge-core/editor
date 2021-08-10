import { VirtualHandle, BaseVirtualHandle } from './Handle'
import { VirtualFileHandle } from './FileHandle'
import { ISerializedDirectoryHandle } from './Comlink'
import { clear } from './IDB'

interface IIdbStoredDirectoryHandle {
	type: 'directory'
	name: string
	children: string[]
}

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
	protected children = new Map<string, VirtualHandle>()

	constructor(
		parent: VirtualDirectoryHandle | null,
		name: string,
		clearDB = false
	) {
		super(parent, name)

		this.updateIdb(clearDB)
	}

	async updateIdb(deleteOld = false) {
		if (deleteOld) {
			await clear()
		}
	}

	protected addChild(child: VirtualHandle) {
		if (this.has(child.name)) {
			throw new Error(
				`A file with the name ${child.name} already exists in this folder`
			)
		}

		this.children.set(child.name, child)
	}
	protected hasChildren() {
		return this.children.size > 0
	}
	protected has(childName: string) {
		return this.children.has(childName)
	}
	serialize(): ISerializedDirectoryHandle {
		return {
			kind: 'directory',
			name: this.name,
			children: [...this.children.values()].map((child: VirtualHandle) =>
				child.serialize()
			),
		}
	}
	static deserialize(
		data: ISerializedDirectoryHandle,
		parent: VirtualDirectoryHandle | null = null
	) {
		const dir = new VirtualDirectoryHandle(parent, data.name)

		for (const child of data.children) {
			if (child.kind === 'directory')
				dir.addChild(VirtualDirectoryHandle.deserialize(child, dir))
			else
				dir.addChild(new VirtualFileHandle(dir, child.name, child.data))
		}

		return dir
	}

	async getDirectoryHandle(
		name: string,
		{ create }: { create?: boolean } = {}
	) {
		let entry = this.children.get(name)

		if (entry && entry.kind === 'file') {
			throw new Error(
				`TypeMismatch: Expected directory with name "${name}", found file`
			)
		} else if (!entry) {
			if (create) {
				entry = new VirtualDirectoryHandle(this, name)

				this.addChild(entry)
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
		let entry = this.children.get(name)

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

				this.addChild(entry)
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
		const entry = this.children.get(name)

		if (!entry) {
			throw new Error(
				`No entry with the name ${name} exists in this folder`
			)
		} else if (
			entry.kind === 'directory' &&
			!recursive &&
			(<VirtualDirectoryHandle>entry).hasChildren()
		) {
			throw new Error(
				`Cannot remove directory with children without "recursive" option being set to true`
			)
		}

		await entry.removeSelf()

		this.children.delete(name)
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
		for (const child of this.children.values()) {
			await child.removeSelf()
		}
	}

	[Symbol.asyncIterator]() {
		return this.children.entries()
	}

	keys() {
		return this.children.keys()
	}
	entries() {
		return this.children.entries()
	}
	values() {
		return this.children.values()
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
