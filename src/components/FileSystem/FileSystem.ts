import { Signal } from '/@/components/Common/Event/Signal'
import json5 from 'json5'
import type { IGetHandleConfig, IMkdirConfig } from './Common'

export class FileSystem extends Signal<void> {
	public _baseDirectory!: FileSystemDirectoryHandle
	get baseDirectory() {
		return this._baseDirectory
	}

	constructor(baseDirectory?: FileSystemDirectoryHandle) {
		super()
		if (baseDirectory) this.setup(baseDirectory)
	}

	setup(baseDirectory: FileSystemDirectoryHandle) {
		this._baseDirectory = baseDirectory
		this.dispatch()
	}

	async getDirectoryHandle(
		path: string,
		{ create, createOnce }: Partial<IGetHandleConfig> = {}
	) {
		if (path === '') return this.baseDirectory

		let current = this.baseDirectory
		const pathArr = path.split(/\\|\//g)

		for (const folder of pathArr) {
			current = await current.getDirectoryHandle(folder, {
				create: createOnce || create,
			})

			if (createOnce) {
				createOnce = false
				create = false
			}
		}

		return current
	}
	async getFileHandle(path: string, create = false) {
		if (path.length === 0) throw new Error(`Error: filePath is empty`)

		const pathArr = path.split(/\\|\//g)
		// This has to be a string because path.length > 0
		const file = pathArr.pop() as string
		const folder = await this.getDirectoryHandle(pathArr.join('/'), {
			create,
		})

		return await folder.getFileHandle(file, { create })
	}

	async mkdir(path: string, { recursive }: Partial<IMkdirConfig> = {}) {
		await this.getDirectoryHandle(path, { create: true })

		// TODO: Fix non recursive mode
		// if (recursive) await this.getDirectoryHandle(path, { create: true })
		// else await this.getDirectoryHandle(path, { createOnce: true })
	}

	readdir(
		path: string,
		config: { withFileTypes: true }
	): Promise<FileSystemHandle[]>
	readdir(path: string, config?: { withFileTypes?: false }): Promise<string[]>
	async readdir(
		path: string,
		{ withFileTypes }: { withFileTypes?: true | false } = {}
	) {
		const dirHandle = await this.getDirectoryHandle(path)
		const files: (string | FileSystemHandle)[] = []

		for await (const handle of dirHandle.values()) {
			if (handle.kind === 'file' && handle.name === '.DS_Store') continue

			if (withFileTypes) files.push(handle)
			else files.push(handle.name)
		}

		return files
	}
	async readFilesFromDir(
		path: string,
		dirHandle:
			| FileSystemDirectoryHandle
			| Promise<FileSystemDirectoryHandle> = this.getDirectoryHandle(path)
	) {
		dirHandle = await dirHandle

		const files: { name: string; path: string; kind: string }[] = []

		for await (const handle of dirHandle.values()) {
			if (handle.kind === 'file' && handle.name === '.DS_Store') continue

			if (handle.kind === 'file')
				files.push({
					name: handle.name,
					kind: handle.kind,
					path: `${path}/${handle.name}`,
				})
			else if (handle.kind === 'directory')
				files.push(
					...(await this.readFilesFromDir(
						`${path}/${handle.name}`,
						handle
					))
				)
		}

		return files
	}

	readFile(path: string) {
		return this.getFileHandle(path).then((fileHandle) =>
			fileHandle.getFile()
		)
	}

	async unlink(path: string) {
		if (path.length === 0) throw new Error(`Error: filePath is empty`)
		const pathArr = path.split(/\\|\//g)

		// This has to be a string because path.length > 0
		const file = <string>pathArr.pop()
		const parentDir = await this.getDirectoryHandle(pathArr.join('/'))

		await parentDir.removeEntry(file, { recursive: true })
	}

	async writeFile(path: string, data: FileSystemWriteChunkType) {
		const fileHandle = await this.getFileHandle(path, true)
		const writable = await fileHandle.createWritable()
		await writable.write(data)
		writable.close()
	}

	async readJSON(path: string) {
		const file = await this.readFile(path)
		try {
			return await json5.parse(await file.text())
		} catch {
			throw new Error(`Invalid JSON: ${path}`)
		}
	}
	writeJSON(path: string, data: any, beautify = false) {
		return this.writeFile(
			path,
			JSON.stringify(data, null, beautify ? '\t' : undefined)
		)
	}

	async copyFile(originPath: string, destPath: string) {
		const fileHandle = await this.getFileHandle(originPath, false)
		const copiedFileHandle = await this.getFileHandle(destPath, true)

		const writable = await copiedFileHandle.createWritable()
		await writable.write(await fileHandle.getFile())
		await writable.close()
	}
}
