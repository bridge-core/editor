import { FileSystem } from '@/FileSystem'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'

let directoryEntry: DirectoryEntry

export class DirectoryEntry {
	protected children: DirectoryEntry[] = []
	public uuid = uuid()

	static async create() {
		if (directoryEntry === undefined)
			directoryEntry = Vue.observable(
				new DirectoryEntry(await FileSystem.get(), null, [])
			)

		return directoryEntry
	}
	constructor(
		protected fileSystem: FileSystem,
		protected parent: DirectoryEntry | null,
		protected path: string[],
		protected _isFile = false
	) {
		if (_isFile) {
			// this.parent?.updateUUID()
		} else {
			fileSystem.readdir(path, { withFileTypes: true }).then(handles => {
				handles.forEach(handle =>
					this.children.push(
						new DirectoryEntry(
							fileSystem,
							this,
							path.concat([handle.name]),
							handle.kind === 'file'
						)
					)
				)
				this.updateUUID()
			})
		}
	}

	get name() {
		return this.path[this.path.length - 1]
	}
	get isFile() {
		return this._isFile
	}

	updateUUID() {
		this.uuid = uuid()
	}
}
