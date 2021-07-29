import { baseUrl } from '/@/utils/baseUrl'
import { Signal } from '/@/components/Common/Event/Signal'
import { unzip, Unzipped } from 'fflate'
import { VirtualFolder } from './VirtualFs/Folder'
import { basename, dirname } from '/@/utils/path'
import { VirtualFile } from './VirtualFs/File'
import json5 from 'json5'
import type { VirtualEntry } from './VirtualFs/Entry'

export class DataLoader extends Signal<void> {
	_virtualFileSystem?: VirtualFolder

	get virtualFileSystem() {
		if (!this._virtualFileSystem) {
			throw new Error('DataLoader: virtualFileSystem is not initialized')
		}
		return this._virtualFileSystem
	}

	constructor() {
		super()
		this.loadData()
	}

	async loadData() {
		// Read packages.zip file
		const rawData = await fetch(baseUrl + 'packages.zip').then((response) =>
			response.arrayBuffer()
		)

		// Unzip data
		const unzipped = await new Promise<Unzipped>((resolve, reject) =>
			unzip(new Uint8Array(rawData), async (error, zip) => {
				if (error) return reject(error)
				resolve(zip)
			})
		)

		// Create virtual filesystem
		this._virtualFileSystem = new VirtualFolder(null, 'global')
		const folders: Record<string, VirtualFolder> = {
			'.': new VirtualFolder(this._virtualFileSystem, 'data'),
		}
		this._virtualFileSystem.addChild(folders['.'])

		for (const path in unzipped) {
			const name = basename(path)
			const parentDir = dirname(path)

			if (path.endsWith('/')) {
				// Current entry is a folder
				folders[path.slice(0, -1)] = new VirtualFolder(
					folders[parentDir],
					name
				)
				folders[parentDir].addChild(folders[path.slice(0, -1)])
			} else {
				// Current entry is a file
				folders[parentDir].addChild(
					new VirtualFile(folders[parentDir], name, unzipped[path])
				)
			}
		}

		this.dispatch()
	}

	async getDirectory(path: string) {
		await this.fired

		if (path === '') return this.virtualFileSystem

		let current = this.virtualFileSystem
		const pathArr = path.split(/\\|\//g)

		for (const folder of pathArr) {
			try {
				current = current.getDirectory(folder)
			} catch {
				throw new Error(
					`Failed to access "${path}": Directory does not exist`
				)
			}
		}

		return current
	}
	async getFile(path: string) {
		await this.fired

		if (path.length === 0) throw new Error(`Error: filePath is empty`)

		const pathArr = path.split(/\\|\//g)
		// This has to be a string because path.length > 0
		const file = pathArr.pop() as string
		const folder = await this.getDirectory(pathArr.join('/'))

		try {
			return folder.getFile(file)
		} catch {
			throw new Error(`File does not exist: "${path}"`)
		}
	}

	async readJSON(path: string) {
		const fileHandle = await this.getFile(path)

		return json5.parse(await fileHandle.text())
	}
	async readFile(path: string) {
		const file = await this.getFile(path)
		return new File([await file.arrayBuffer()], file.name)
	}

	async iterateDir(
		baseDirectory: VirtualFolder,
		callback: (
			fileHandle: VirtualFile,
			path: string
		) => Promise<void> | void,
		ignoreFolders: Set<string> = new Set(),
		path = ''
	) {
		for await (const handle of baseDirectory.values()) {
			const currentPath =
				path.length === 0 ? handle.name : `${path}/${handle.name}`

			if (handle.kind === 'file') {
				if (handle.name[0] === '.') continue
				await callback(<VirtualFile>handle, currentPath)
			} else if (
				handle.kind === 'directory' &&
				!ignoreFolders.has(currentPath)
			) {
				await this.iterateDir(
					<VirtualFolder>handle,
					callback,
					ignoreFolders,
					currentPath
				)
			}
		}
	}

	readdir(
		path: string,
		config: { withFileTypes: true }
	): Promise<VirtualFolder[]>
	readdir(path: string, config?: { withFileTypes?: false }): Promise<string[]>
	async readdir(
		path: string,
		{ withFileTypes }: { withFileTypes?: true | false } = {}
	) {
		const dirHandle = await this.getDirectory(path)
		const files: (string | VirtualEntry)[] = []

		for await (const handle of dirHandle.values()) {
			if (handle.kind === 'file' && handle.name === '.DS_Store') continue

			if (withFileTypes) files.push(handle)
			else files.push(handle.name)
		}

		return files
	}
}
