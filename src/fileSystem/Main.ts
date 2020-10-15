import { createSelectProjectFolderWindow } from '@/components/Windows/Project/SelectFolder/definition'
import { createInformationWindow } from '@/components/Windows/Common/CommonDefinitions'
import { IFileSystem, IGetHandleConfig, IMkdirConfig } from './Common'

let fileSystem: IFileSystem
export class FileSystem {
	static database: IDBDatabase
	static fsReadyPromiseResolves: ((fileSystem: IFileSystem) => void)[] = []

	constructor(protected baseDirectory: FileSystemDirectoryHandle) {
		Promise.all([
			this.mkdir(['projects']),
			this.mkdir(['plugins']),
			this.mkdir(['data']),
		]).then(() => {
			FileSystem.fsReadyPromiseResolves.forEach(resolve => resolve(this))
			FileSystem.database.close()
		})
	}

	static create() {
		const request = indexedDB.open('bridgeFSData', 1)
		request.onerror = () => this.requestFolderSelection()
		request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
			const upgradeDb = (event.target as IDBOpenDBRequest).result

			if (!upgradeDb.objectStoreNames.contains('fileHandles')) {
				const store = upgradeDb.createObjectStore('fileHandles', {
					keyPath: 'fileHandleName',
				})
				store.createIndex('fileHandleName', 'fileHandleName', {
					unique: true,
				})
			}
		}
		request.onsuccess = () => {
			this.database = request.result
			this.database.onerror = () => this.requestFolderSelection()
			const transaction = this.database.transaction(
				['fileHandles'],
				'readonly'
			)
			const store = transaction.objectStore('fileHandles')
			const getRequest = store.get('bridgeBaseDir')

			getRequest.onerror = () => this.requestFolderSelection()
			getRequest.onsuccess = () => {
				if (!getRequest.result || !getRequest.result.fileHandle)
					this.requestFolderSelection()
				else
					this.onReceivedFileHandle(
						getRequest.result.fileHandle,
						false
					)
			}
		}
	}
	protected static requestFolderSelection() {
		createSelectProjectFolderWindow(fileHandle =>
			this.onReceivedFileHandle(fileHandle)
		)
	}
	static onReceivedFileHandle(
		fileHandle: FileSystemDirectoryHandle,
		saveFileHandle = true
	) {
		if (saveFileHandle && this.database && fileHandle) {
			const transaction = this.database.transaction(
				['fileHandles'],
				'readwrite'
			)
			const store = transaction.objectStore('fileHandles')
			store.add({ fileHandleName: 'bridgeBaseDir', fileHandle })
		}

		this.verifyPermissions(fileHandle)
	}
	static verifyPermissions(fileHandle: FileSystemDirectoryHandle) {
		const opts = { writable: true, mode: 'readwrite' } as const

		createInformationWindow(
			'Project Folder',
			'bridge. needs access to its project folder in order to work correctly.',
			async () => {
				// Check if we already have permission && request permission if not
				if (
					(await fileHandle.queryPermission(opts)) === 'granted' ||
					(await fileHandle.requestPermission(opts)) === 'granted'
				) {
					fileSystem = new FileSystem(fileHandle)
				} else {
					this.verifyPermissions(fileHandle)
				}
			}
		)
	}
	static get() {
		if (fileSystem !== undefined) return fileSystem

		return new Promise((resolve: (fileSystem: IFileSystem) => void) => {
			this.fsReadyPromiseResolves.push(resolve)
		})
	}
	static set(fs: IFileSystem) {
		fileSystem = fs
	}

	protected async getDirectoryHandle(
		path: string[],
		{ create, createOnce }: Partial<IGetHandleConfig> = {}
	) {
		let current = this.baseDirectory

		for (const folder of path) {
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
	protected async getFileHandle(path: string[], create = false) {
		if (path.length === 0) throw new Error(`Error: filePath is empty`)

		path = [...path]
		// This has to be a string because path.length > 0
		const file = path.pop() as string
		const folder = await this.getDirectoryHandle(path, { create })

		return await folder.getFileHandle(file, { create })
	}

	async mkdir(path: string[], { recursive }: Partial<IMkdirConfig> = {}) {
		if (recursive) await this.getDirectoryHandle(path, { create: true })
		else await this.getDirectoryHandle(path, { createOnce: true })
	}

	readdir(
		path: string[],
		{ withFileTypes }: { withFileTypes: true }
	): Promise<FileSystemHandle[]>
	readdir(
		path: string[],
		{ withFileTypes }: { withFileTypes?: false }
	): Promise<string[]>
	async readdir(
		path: string[],
		{ withFileTypes }: { withFileTypes?: true | false } = {}
	) {
		const dirHandle = await this.getDirectoryHandle(path)
		const files: (string | FileSystemHandle)[] = []

		for await (const handle of dirHandle.values()) {
			if (withFileTypes) files.push(handle)
			else files.push(handle.name)
		}

		return files
	}

	readFile(path: string[]) {
		return this.getFileHandle(path).then(fileHandle => fileHandle.getFile())
	}

	async unlink(path: string[]) {
		if (path.length === 0) throw new Error(`Error: filePath is empty`)
		path = [...path]

		// This has to be a string because path.length > 0
		const file = path.pop() as string
		const parentDir = await this.getDirectoryHandle(path)

		await parentDir.removeEntry(file, { recursive: true })
	}

	async writeFile(path: string[], data: FileSystemWriteChunkType) {
		const fileHandle = await this.getFileHandle(path, true)
		const writable = await fileHandle.createWritable()
		await writable.write(data)
		writable.close()
	}
}
