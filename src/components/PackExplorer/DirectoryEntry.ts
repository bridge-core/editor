import { platform } from '/@/utils/os'
import { v4 as uuid } from 'uuid'
import { App } from '/@/App'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { reactive } from '@vue/composition-api'
import { settingsState } from '../Windows/Settings/SettingsState'
import { join } from '/@/utils/path'

export class DirectoryEntry {
	protected children: DirectoryEntry[] = []
	protected displayName?: string
	public uuid = uuid()
	public isFolderOpen = false
	protected hasLoadedChildren: boolean
	public isLoading = false
	protected type: 'file' | 'folder' | 'virtualFolder'

	static async create(startPath: string[] = [], isFile = false) {
		const folder = new DirectoryEntry(
			App.instance.fileSystem,
			null,
			startPath,
			isFile
		)
		folder.open()
		return <DirectoryEntry>reactive(folder)
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
			if (this.isFolderOpen) this.loadChildren(path)
		}

		this.type = this._isFile
			? 'file'
			: settingsState?.general?.enablePackSpider ?? false
			? 'virtualFolder'
			: 'folder'
		this.hasLoadedChildren = this._isFile
	}

	protected async loadChildren(path: string[]) {
		this.isLoading = true
		const app = await App.getApp()
		const dirents: any[] =
			(await app.project?.packIndexer.readdir(path, {
				withFileTypes: true,
			})) ?? []

		this.children = []
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
				(typeof handle.path === 'string'
					? handle.path.split('/')
					: handle.path) ?? path.concat([handle.name]),
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
	async createOpenStateMap() {
		const map: Record<string, boolean> = {}

		await this.iterate((child) => {
			if (!child._isFile) map[child.getPath()] = child.isFolderOpen
		})

		return map
	}
	async refresh() {
		const map = await this.createOpenStateMap()
		await this.loadChildren(this.path)

		await this.iterate(async (child) => {
			if (!child._isFile && map[child.getPath()]) await child.open()
		})
	}

	get name() {
		return this.displayName ?? this.path[this.path.length - 1]
	}
	get isFile() {
		return this._isFile
	}
	get color() {
		return App.packType.get(this.getPath())?.color
	}
	get icon() {
		return App.fileType.get(this.getPath())?.icon
	}
	getPath() {
		return this.path?.join('/') ?? []
	}
	protected getPathWithoutPack() {
		const path = [...this.path]
		path.shift()
		return path.join('/')
	}
	setPath(path: string) {
		return (this.path = path.split('/'))
	}
	updatePath(newPath: string) {
		this.path = newPath.split('/')

		// If current entry is a directory, update all children
		if (!this._isFile) {
			this.children.forEach((child) => {
				child.updatePath(join(newPath, child.name))
			})
		}
	}
	/**
	 * @returns Whether to close the window
	 */
	async open() {
		if (this.isFile) {
			App.ready.once(async (app) => {
				const fileHandle = await app.fileSystem.getFileHandle(
					this.getPath()
				)
				await app.project?.openFile(fileHandle)
			})
			return true
		} else {
			this.isFolderOpen = !this.isFolderOpen
			if (!this.hasLoadedChildren) await this.loadChildren(this.path)
			return false
		}
	}

	setDisplayName(name: string) {
		this.displayName = name
	}

	remove() {
		if (this.parent === undefined)
			throw new Error('FileDisplayer: Cannot delete root of FS')

		this.parent!.children = this.parent!.children.filter(
			(child) => child !== this
		)
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

	async iterate(cb: (child: DirectoryEntry) => Promise<void> | void) {
		await cb(this)
		await Promise.all(this.children.map((child) => child.iterate(cb)))
	}
}
