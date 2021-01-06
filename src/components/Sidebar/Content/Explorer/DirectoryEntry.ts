import { mainTabSystem } from '@/components/TabSystem/Main'
import { IFileSystem } from '@/components/FileSystem/Common'
import { FileSystem } from '@/components/FileSystem/Main'
import { platform } from '@/utils/os'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'

export class DirectoryEntry {
	protected children: DirectoryEntry[] = []
	public uuid = uuid()
	public isFolderOpen = false

	static async create() {
		return Vue.observable(
			new DirectoryEntry(await FileSystem.get(), null, [
				'projects',
				'test',
			])
		)
	}
	constructor(
		protected fileSystem: IFileSystem,
		protected parent: DirectoryEntry | null,
		protected path: string[],
		protected _isFile = false
	) {
		if (_isFile) {
			// this.parent?.updateUUID()
		} else {
			fileSystem
				.readdir(path.join('/'), { withFileTypes: true })
				.then(handles => {
					handles.forEach(handle => {
						if (
							platform() === 'darwin' &&
							handle.name === '.DS_Store' &&
							handle.kind === 'file'
						)
							return

						this.children.push(
							new DirectoryEntry(
								fileSystem,
								this,
								path.concat([handle.name]),
								handle.kind === 'file'
							)
						)
					})
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
	getPath() {
		return this.path.join('/')
	}
	open() {
		if (this.isFile) mainTabSystem.open(this.getPath())
		else this.isFolderOpen = !this.isFolderOpen
	}
	getFileContent() {
		if (!this.isFile) throw new Error(`Called getFileContent on directory`)

		return this.fileSystem.readFile(this.getPath()).then(file => {
			if (file instanceof ArrayBuffer) {
				const dec = new TextDecoder('utf-8')
				return dec.decode(file)
			}
			return file.text()
		})
	}
	saveFileContent(data: FileSystemWriteChunkType) {
		this.fileSystem.writeFile(this.getPath(), data)
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
