import { VirtualEntry } from './Entry'
import type { VirtualFile } from './File'

/**
 * A class that implements a virtual folder
 */
export class VirtualFolder extends VirtualEntry {
	public readonly kind = 'directory'
	protected children = new Map<string, VirtualEntry>()

	constructor(parent: VirtualFolder | null, name: string) {
		super(parent, name)
	}

	addChild(child: VirtualEntry) {
		if (this.has(child.name)) {
			throw new Error(
				`A file with the name ${child.name} already exists in this folder`
			)
		}

		this.children.set(child.name, child)
	}

	getDirectory(name: string) {
		const entry = this.children.get(name)

		if (!entry || entry.kind === 'file') {
			throw new Error(
				`No directory with the name ${name} exists in this folder`
			)
		}

		return <VirtualFolder>entry
	}
	getFile(name: string) {
		const entry = this.children.get(name)
		if (!entry || entry.kind === 'directory') {
			throw new Error(
				`No file with the name ${name} exists in this folder`
			)
		}

		return <VirtualFile>entry
	}

	has(childName: string) {
		return this.children.has(childName)
	}

	entries() {
		return this.children.entries()
	}
	values() {
		return this.children.values()
	}
}
