export class FileSystem {
	constructor(protected baseDirectory: FileSystemDirectoryHandle) {}

	protected async getDirectoryHandle(
		path: string[],
		{ create, createOnce }: Partial<GetHandleConfig> = {}
	) {
		let current = this.baseDirectory

		for (const folder of path) {
			current = await current.getDirectory(folder, {
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
