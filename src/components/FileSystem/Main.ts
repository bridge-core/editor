import { createSelectProjectFolderWindow } from '@/components/Windows/Project/SelectFolder/definition'
import { createInformationWindow } from '@/components/Windows/Common/CommonDefinitions'
import { IFileSystem, IGetHandleConfig, IMkdirConfig } from './Common'
import { translate } from '@/utils/locales'
import { get, set } from 'idb-keyval'

let fileSystem: IFileSystem
export class FileSystem {
	static fsReadyPromiseResolves: ((fileSystem: IFileSystem) => void)[] = []
	static confirmPermissionWindow: any = null

	constructor(protected baseDirectory: FileSystemDirectoryHandle) {
		Promise.all([
			this.mkdir('projects'),
			this.mkdir('plugins'),
			this.mkdir('data'),
		]).then(() => {
			FileSystem.fsReadyPromiseResolves.forEach(resolve => resolve(this))
		})
	}

	static async create() {
		const fileHandle = await get<FileSystemDirectoryHandle>('bridgeBaseDir')
		if (!fileHandle)
			createSelectProjectFolderWindow(fileHandle => {
				if (fileHandle) {
					set('bridgeBaseDir', fileHandle)
				}

				this.verifyPermissions(fileHandle)
			})
		else await this.verifyPermissions(fileHandle)
	}
	static async verifyPermissions(fileHandle: FileSystemDirectoryHandle) {
		const opts = { writable: true, mode: 'readwrite' } as const

		if (
			(await fileHandle.queryPermission(opts)) !== 'granted' &&
			this.confirmPermissionWindow === null
		)
			this.confirmPermissionWindow = createInformationWindow(
				translate('windows.projectFolder.title'),
				translate('windows.projectFolder.content'),
				async () => {
					this.confirmPermissionWindow = null
					// Check if we already have permission && request permission if not
					if (
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
		path: string,
		{ create, createOnce }: Partial<IGetHandleConfig> = {}
	) {
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
	protected async getFileHandle(path: string, create = false) {
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
		if (recursive) await this.getDirectoryHandle(path, { create: true })
		else await this.getDirectoryHandle(path, { createOnce: true })
	}

	readdir(
		path: string,
		{ withFileTypes }: { withFileTypes: true }
	): Promise<FileSystemHandle[]>
	readdir(
		path: string,
		{ withFileTypes }: { withFileTypes?: false }
	): Promise<string[]>
	async readdir(
		path: string,
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

	readFile(path: string) {
		return this.getFileHandle(path).then(fileHandle => fileHandle.getFile())
	}

	async unlink(path: string) {
		if (path.length === 0) throw new Error(`Error: filePath is empty`)
		const pathArr = path.split(/\\|\//g)

		// This has to be a string because path.length > 0
		const file = pathArr.pop() as string
		const parentDir = await this.getDirectoryHandle(pathArr.join('/'))

		await parentDir.removeEntry(file, { recursive: true })
	}

	async writeFile(path: string, data: FileSystemWriteChunkType) {
		const fileHandle = await this.getFileHandle(path, true)
		const writable = await fileHandle.createWritable()
		await writable.write(data)
		writable.close()
	}
}
