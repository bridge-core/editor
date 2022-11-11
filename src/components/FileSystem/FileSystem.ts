// This import is relative so the compiler types build correctly
import { Signal } from '../Common/Event/Signal'
import json5 from 'json5'
import type { IGetHandleConfig, IMkdirConfig } from './Common'
import { iterateDirParallel } from '/@/utils/iterateDir'
import { join, dirname, basename } from '/@/utils/path'
import { AnyDirectoryHandle, AnyFileHandle, AnyHandle } from './Types'
import { getStorageDirectory } from '/@/utils/getStorageDirectory'
import { VirtualFileHandle } from './Virtual/FileHandle'
import { VirtualDirectoryHandle } from './Virtual/DirectoryHandle'

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
		if (path === '' || path === '.') return this.baseDirectory

		let current = this.baseDirectory
		const pathArr = path.split(/\\|\//g)
		if (pathArr[0] === '.') pathArr.shift()
		// Dash loads global extensions from "extensions/" but this folder is no longer used for bridge. projects
		if (pathArr[0] === 'extensions') {
			pathArr[0] = '~local'
			pathArr.splice(1, 0, 'extensions')
		}
		if (pathArr[0] === '~local') {
			current = await getStorageDirectory()
			pathArr.shift()
		}

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
	async pathTo(handle: AnyHandle) {
		const localHandle = await getStorageDirectory()
		// We can only resolve paths to virtual files if the user uses the file system polyfill
		if (
			handle instanceof VirtualFileHandle &&
			!(localHandle instanceof VirtualDirectoryHandle)
		)
			return

		let path = await localHandle
			.resolve(<any>handle)
			.then((path) => path?.join('/'))

		if (path) {
			path = '~local/' + path
		} else {
			path = await this.baseDirectory
				.resolve(<any>handle)
				.then((path) => path?.join('/'))
		}

		return path
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
		const promises = []

		for await (const handle of dirHandle.values()) {
			if (handle.kind === 'file' && handle.name === '.DS_Store') continue

			if (handle.kind === 'file')
				files.push({
					name: handle.name,
					kind: handle.kind,
					path: `${path}/${handle.name}`,
				})
			else if (handle.kind === 'directory') {
				promises.push(
					this.readFilesFromDir(
						`${path}/${handle.name}`,
						handle
					).then((subFiles) => files.push(...subFiles))
				)
			}
		}

		await Promise.allSettled(promises)

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
		// Safari doesn't support createWritable yet
		// if (typeof fileHandle.createWritable !== 'function') {
		// 	// @ts-ignore
		// 	const handle = await fileHandle.createAccessHandle({
		// 		mode: 'in-place',
		// 	})
		// 	await handle.writable.getWriter().write(data)
		// 	handle.close()
		// } else {
		const writable = await fileHandle.createWritable({
			keepExistingData: false,
		})
		await writable.write(data)
		await writable.close()
		// }
	}

	async readJSON(path: string) {
		const file = await this.readFile(path)
		try {
			return await json5.parse(await file.text())
		} catch {
			throw new Error(`Invalid JSON: ${path}`)
		}
	}
	async readJsonHandle(fileHandle: AnyFileHandle) {
		const file = await fileHandle.getFile()

		try {
			return await json5.parse(await file.text())
		} catch {
			throw new Error(`Invalid JSON: ${fileHandle.name}`)
		}
	}
	writeJSON(path: string, data: any, beautify = false) {
		return this.writeFile(
			path,
			JSON.stringify(data, null, beautify ? '\t' : undefined)
		)
	}

	// TODO: Use moveHandle() util function
	// This function can utilize FileSystemHandle.move() where available
	// and therefore become more efficient
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
		await this.write(destHandle, await originHandle.getFile())

		return destHandle
	}
	async copyFolder(originPath: string, destPath: string) {
		const originHandle = await this.getDirectoryHandle(originPath, {
			create: false,
		})

		await iterateDirParallel(originHandle, async (fileHandle, filePath) => {
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

		await iterateDirParallel(originHandle, async (fileHandle, filePath) => {
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

	async getDirectoryHandlesFromGlob(glob: string, startPath = '.') {
		const globParts = glob.split(/\/|\\/g)
		const handles = new Set<AnyDirectoryHandle>([
			await this.getDirectoryHandle(startPath),
		])

		for (const part of globParts) {
			if (part === '*') {
				for (const current of [...handles.values()]) {
					handles.delete(current)

					for await (const child of current.values()) {
						if (child.kind === 'directory') {
							handles.add(child)
						}
					}
				}
			} else if (part === '**') {
				console.warn('"**" is not supported yet')
				return []
			} else {
				for (const current of [...handles.values()]) {
					handles.delete(current)

					try {
						handles.add(await current.getDirectoryHandle(part))
					} catch (err) {}
				}
			}

			// If there are no more handles, we're done
			if (handles.size === 0) return []
		}

		return [...handles.values()]
	}
}
