import { IFileSystem } from '/@/components/FileSystem/Common'
import { platform } from '/@/utils/os'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'
import { App } from '/@/App'
import { PackType } from '/@/components/Data/PackType'
import { FileType } from '/@/components/Data/FileType'

export class DirectoryEntry {
	protected children: DirectoryEntry[] = []
	protected displayName?: string
	public uuid = uuid()
	public isFolderOpen = false
	protected hasLoadedChildren = this._isFile
	public isLoading = false

	static async create(startPath: string[] = [], isFile = false) {
		const folder = new DirectoryEntry(
			App.instance.fileSystem,
			null,
			startPath,
			isFile
		)
		folder.open()
		return Vue.observable(folder)
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
			if (this.isFolderOpen) this.loadChildren(path)
		}
	}

	protected async loadChildren(path: string[]) {
		this.isLoading = true
		const app = await App.getApp()
		const dirents: any[] =
			(await app.project?.packIndexer.readdir(path, {
				withFileTypes: true,
			})) ?? []

		for (const handle of dirents) {
			if (
				platform() === 'darwin' &&
				handle.name === '.DS_Store' &&
				handle.kind === 'file'
			)
				return

			const dirent = new DirectoryEntry(
				this.fileSystem,
				this,
				handle.path ?? path.concat([handle.name]),
				handle.kind === 'file'
			)
			dirent.setDisplayName(handle.displayName)
			if (handle.filePath) dirent.setPath(handle.filePath)
			this.children.push(dirent)
		}

		this.sortChildren()
		this.isLoading = false
		this.hasLoadedChildren = true
	}

	get name() {
		return this.displayName ?? this.path[this.path.length - 1]
	}
	get isFile() {
		return this._isFile
	}
	get color() {
		return PackType.get(this.getFullPath())?.color
	}
	get icon() {
		return FileType.get(this.getPath())?.icon
	}
	getFullPath() {
		return ['projects', App.instance.selectedProject]
			.concat(this.path)
			.join('/')
	}
	getPath() {
		return this.path.join('/')
	}
	getPathWithoutPack() {
		const path = [...this.path]
		path.shift()
		return path.join('/')
	}
	setPath(path: string) {
		return (this.path = path.split('/'))
	}
	/**
	 * @returns Whether to close the window
	 */
	open() {
		if (this.isFile) {
			App.ready.once(app => app.project?.openFile(this.getFullPath()))
			return true
		} else {
			this.isFolderOpen = !this.isFolderOpen
			if (!this.hasLoadedChildren) this.loadChildren(this.path)
			return false
		}
	}

	setDisplayName(name: string) {
		this.displayName = name
	}

	protected sortChildren() {
		this.children = this.children.sort((a, b) => {
			if (a.isFile && !b.isFile) return 1
			if (!a.isFile && b.isFile) return -1
			if (a.isFile) {
				if (a.getPathWithoutPack() > b.getPathWithoutPack()) return 1
				if (a.getPathWithoutPack() < b.getPathWithoutPack()) return -1
			} else {
				if (a.name > b.name) return 1
				if (a.name < b.name) return -1
			}

			return 0
		})
	}
	updateUUID() {
		this.uuid = uuid()
	}
}
