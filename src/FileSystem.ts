import { createSelectProjectFolderWindow } from '@/components/Windows/Project/SelectFolder/definition'
import { createInformationWindow } from '@/components/Windows/Common/CommonDefinitions'

let fileSystem: FileSystem
export class FileSystem {
	static database: IDBDatabase
	constructor(protected baseDirectory: FileSystemDirectoryHandle) {}

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
				console.log(getRequest.result)
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
		console.log(fileHandle, this.database)
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
			'FS Access',
			'bridge. needs access to your file system in order to work correctly.',
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
		return fileSystem
	}

	protected async getDirectoryHandle(
		path: string[],
		{ create, createOnce }: Partial<GetHandleConfig> = {}
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

		// This has to be a string because path.length > 0
		const file = path.pop() as string
		const folder = await this.getDirectoryHandle(path, { create })

		return await folder.getFileHandle(file, { create })
	}

	mkdir(path: string[], { recursive }: Partial<MkdirConfig> = {}) {
		if (recursive) return this.getDirectoryHandle(path, { create: true })
		else return this.getDirectoryHandle(path, { createOnce: true })
	}

	readdir() {
		//
	}

	readFile(path: string[]) {
		return this.getFileHandle(path)
			.then(fileHandle => fileHandle.getFile())
			.then(file => file.text())
	}

	async unlink(path: string[]) {
		if (path.length === 0) throw new Error(`Error: filePath is empty`)

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

interface MkdirConfig {
	recursive: boolean
}

interface GetHandleConfig {
	create: boolean
	createOnce: boolean
}
