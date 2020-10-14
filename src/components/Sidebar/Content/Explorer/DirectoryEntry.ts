import { FileSystem } from '@/FileSystem'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'

export class DirectoryEntry {
	protected children: DirectoryEntry[] = []
	public uuid = uuid()

	static async create() {
		return Vue.observable(
			new DirectoryEntry(await FileSystem.get(), null, [
				'projects',
				'test',
			])
		)
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
				this.sortChildren()
			})
		}
	}

	get name() {
		return this.path[this.path.length - 1]
	}
	get isFile() {
		return this._isFile
	}

	protected sortChildren() {
		this.children = this.children.sort((a, b) => {
			if (a.isFile && !b.isFile) return 1
			if (!a.isFile && b.isFile) return -1
			if (a.name > b.name) return 1
			if (a.name < b.name) return -1
			return 0
		})
	}
	updateUUID() {
		this.uuid = uuid()
	}
}
