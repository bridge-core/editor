import { baseUrl } from '/@/utils/baseUrl'
import { Signal } from '/@/components/Common/Event/Signal'
import { unzip, Unzipped } from 'fflate'
import { VirtualDirectoryHandle } from '../FileSystem/Virtual/DirectoryHandle'
import { basename, dirname } from '/@/utils/path'
import { VirtualFileHandle } from '../FileSystem/Virtual/FileHandle'
import json5 from 'json5'
import type { VirtualHandle } from '../FileSystem/Virtual/Handle'
import { FileSystem } from '../FileSystem/FileSystem'

export class DataLoader extends Signal<void> {
	_virtualFileSystem?: VirtualDirectoryHandle

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
		this._virtualFileSystem = new VirtualDirectoryHandle(null, 'global')
		const defaultHandle = await this._virtualFileSystem.getDirectoryHandle(
			'data',
			{ create: true }
		)
		const folders: Record<string, VirtualDirectoryHandle> = {
			'.': defaultHandle,
		}

		for (const path in unzipped) {
			const name = basename(path)
			const parentDir = dirname(path)

			if (path.endsWith('/')) {
				// Current entry is a folder
				const handle = await folders[parentDir].getDirectoryHandle(
					name,
					{ create: true }
				)
				folders[path.slice(0, -1)] = handle
			} else {
				// Current entry is a file
				await folders[parentDir].getFileHandle(name, {
					create: true,
					initialData: unzipped[path],
				})
			}
		}

		this.dispatch()
	}

	async getDirectoryHandle(path: string) {
		await this.fired

		if (path === '') return this.virtualFileSystem

		let current = this.virtualFileSystem
		const pathArr = path.split(/\\|\//g)

		for (const folder of pathArr) {
			try {
				current = await current.getDirectoryHandle(folder)
			} catch {
				throw new Error(
					`Failed to access "${path}": Directory does not exist`
				)
			}
		}

		return current
	}
	async getFileHandle(path: string) {
		await this.fired

		if (path.length === 0) throw new Error(`Error: filePath is empty`)

		const pathArr = path.split(/\\|\//g)
		// This has to be a string because path.length > 0
		const file = pathArr.pop() as string
		const folder = await this.getDirectoryHandle(pathArr.join('/'))

		try {
			return await folder
				.getFileHandle(file)
				.then((file) => file.getFile())
		} catch {
			throw new Error(`File does not exist: "${path}"`)
		}
	}

	async readJSON(path: string) {
		const fileHandle = await this.getFileHandle(path)

		return json5.parse(await fileHandle.text())
	}
	readFile(path: string) {
		return this.getFileHandle(path)
	}

	async iterateDir(
		baseDirectory: VirtualDirectoryHandle,
		callback: (
			fileHandle: VirtualFileHandle,
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
				await callback(<VirtualFileHandle>handle, currentPath)
			} else if (
				handle.kind === 'directory' &&
				!ignoreFolders.has(currentPath)
			) {
				await this.iterateDir(
					<VirtualDirectoryHandle>handle,
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
	): Promise<VirtualDirectoryHandle[]>
	readdir(path: string, config?: { withFileTypes?: false }): Promise<string[]>
	async readdir(
		path: string,
		{ withFileTypes }: { withFileTypes?: true | false } = {}
	) {
		const dirHandle = await this.getDirectoryHandle(path)
		const files: (string | VirtualHandle)[] = []

		for await (const handle of dirHandle.values()) {
			if (handle.kind === 'file' && handle.name === '.DS_Store') continue

			if (withFileTypes) files.push(handle)
			else files.push(handle.name)
		}

		return files
	}
}
