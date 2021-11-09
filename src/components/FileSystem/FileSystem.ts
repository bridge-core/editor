// This import is relative so the compiler types build correctly
import { Signal } from '../Common/Event/Signal'
import json5 from 'json5'
import type { IGetHandleConfig, IMkdirConfig } from './Common'
import { iterateDir } from '/@/utils/iterateDir'
import { join, dirname, basename } from '/@/utils/path'
import { AnyDirectoryHandle, AnyFileHandle, AnyHandle } from './Types'

export class FileSystem extends Signal<void> {
	protected _baseDirectory!: AnyDirectoryHandle
	get baseDirectory() {
		return this._baseDirectory
	}

	constructor(baseDirectory?: AnyDirectoryHandle) {
		super()
		if (baseDirectory) this.setup(baseDirectory)
	}

	setup(baseDirectory: AnyDirectoryHandle) {
		this._baseDirectory = baseDirectory

		if (!this.hasFired) this.dispatch()
	}

	async getDirectoryHandle(
		path: string,
		{ create, createOnce }: Partial<IGetHandleConfig> = {}
	) {
		if (path === '') return this.baseDirectory

		let current = this.baseDirectory
		const pathArr = path.split(/\\|\//g)

		for (const folder of pathArr) {
			try {
				current = await current.getDirectoryHandle(folder, {
					create: createOnce || create,
				})
			} catch {
				throw new Error(
					`Failed to access "${path}": Directory does not exist`
				)
			}

			if (createOnce) {
				createOnce = false
				create = false
			}
		}

		return current
	}
	async getFileHandle(path: string, create = false) {
		if (path.length === 0) throw new Error(`Error: filePath is empty`)

		const folder = await this.getDirectoryHandle(dirname(path), {
			create,
		})

		try {
			return await folder.getFileHandle(basename(path), { create })
		} catch {
			throw new Error(`File does not exist: "${path}"`)
		}
	}
	pathTo(fileHandle: AnyFileHandle) {
		return this.baseDirectory
			.resolve(<any>fileHandle)
			.then((path) => path?.join('/'))
	}

	async mkdir(path: string, { recursive }: Partial<IMkdirConfig> = {}) {
		await this.getDirectoryHandle(path, { create: true })

		// TODO: Fix non recursive mode
		// if (recursive) await this.getDirectoryHandle(path, { create: true })
		// else await this.getDirectoryHandle(path, { createOnce: true })
	}

	readdir(path: string, config: { withFileTypes: true }): Promise<AnyHandle[]>
	readdir(path: string, config?: { withFileTypes?: false }): Promise<string[]>
	async readdir(
		path: string,
		{ withFileTypes }: { withFileTypes?: true | false } = {}
	) {
		const dirHandle = await this.getDirectoryHandle(path)
		const files: (string | AnyHandle)[] = []

		for await (const handle of dirHandle.values()) {
			if (handle.kind === 'file' && handle.name === '.DS_Store') continue

			if (withFileTypes) files.push(<AnyHandle>handle)
			else files.push(handle.name)
		}

		return files
	}
	async readFilesFromDir(
		path: string,
		dirHandle:
			| AnyDirectoryHandle
			| Promise<AnyDirectoryHandle> = this.getDirectoryHandle(path)
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
		let parentDir: AnyDirectoryHandle
		try {
			parentDir = await this.getDirectoryHandle(pathArr.join('/'))
		} catch {
			return
		}

		try {
			await parentDir.removeEntry(file, { recursive: true })
		} catch {}
	}

	async writeFile(path: string, data: FileSystemWriteChunkType) {
		const fileHandle = await this.getFileHandle(path, true)
		await this.write(fileHandle, data)
		return fileHandle
	}

	async write(fileHandle: AnyFileHandle, data: FileSystemWriteChunkType) {
		// @ts-ignore
		if (typeof fileHandle.createAccessHandle === 'function') {
			// @ts-ignore
			const handle = await fileHandle.createAccessHandle({
				mode: 'in-place',
			})
			await handle.writable.getWriter().write(data)
			handle.close()
		} else {
			const writable = await fileHandle.createWritable()
			await writable.write(data)
			await writable.close()
		}
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

	async move(path: string, newPath: string) {
		if (await this.fileExists(path)) {
			await this.copyFile(path, newPath)
		} else if (await this.directoryExists(path)) {
			await this.copyFolder(path, newPath)
		} else {
			throw new Error(`File or folder does not exist: ${path}`)
		}

		await this.unlink(path)
	}
	async copyFile(originPath: string, destPath: string) {
		const originHandle = await this.getFileHandle(originPath, false)
		const destHandle = await this.getFileHandle(destPath, true)

		return await this.copyFileHandle(originHandle, destHandle)
	}
	async copyFileHandle(
		originHandle: AnyFileHandle,
		destHandle: AnyFileHandle
	) {
		const writable = await destHandle.createWritable()
		await writable.write(await originHandle.getFile())
		await writable.close()
		return destHandle
	}
	async copyFolder(originPath: string, destPath: string) {
		const originHandle = await this.getDirectoryHandle(originPath, {
			create: false,
		})

		await iterateDir(originHandle, async (fileHandle, filePath) => {
			await this.copyFileHandle(
				fileHandle,
				await this.getFileHandle(join(destPath, filePath), true)
			)
		})
	}
	async copyFolderByHandle(
		originHandle: AnyDirectoryHandle,
		destHandle: AnyDirectoryHandle
	) {
		const destFs = new FileSystem(destHandle)

		await iterateDir(originHandle, async (fileHandle, filePath) => {
			await this.copyFileHandle(
				fileHandle,
				await destFs.getFileHandle(filePath, true)
			)
		})
	}

	loadFileHandleAsDataUrl(fileHandle: AnyFileHandle) {
		return new Promise<string>(async (resolve, reject) => {
			const reader = new FileReader()

			try {
				const file = await fileHandle.getFile()

				reader.addEventListener('load', () => {
					resolve(<string>reader.result)
				})
				reader.addEventListener('error', reject)
				reader.readAsDataURL(file)
			} catch {
				reject(`File does not exist: "${fileHandle.name}"`)
			}
		})
	}

	async fileExists(path: string) {
		try {
			await this.getFileHandle(path)
			return true
		} catch {
			return false
		}
	}

	async directoryExists(path: string) {
		try {
			await this.getDirectoryHandle(path)
			return true
		} catch {
			return false
		}
	}
}
