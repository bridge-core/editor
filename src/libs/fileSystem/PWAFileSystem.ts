import { BaseFileSystem } from './BaseFileSystem'

export class PWAFileSystem extends BaseFileSystem {
	protected baseHandle: FileSystemDirectoryHandle | null = null

	public setBaseHandle(handle: FileSystemDirectoryHandle) {
		this.baseHandle = handle

		this.eventSystem.dispatch('reloaded', null)
	}

	public async writeFile(path: string, content: FileSystemWriteChunkType) {
		if (this.baseHandle === null) return

		const handle = await this.baseHandle.getFileHandle(path, {
			create: true,
		})

		const writable: FileSystemWritableFileStream =
			await handle.createWritable()

		await writable.write(content)
		await writable.close()
	}

	public async readDirectory(path: string): Promise<string[]> {
		if (this.baseHandle === null) {
			return []
		}

		const handle = await this.baseHandle.getDirectoryHandle(path)
		const entries = handle.entries()

		const names = []

		for await (const entry of entries) {
			names.push(entry[0])
		}

		return names
	}

	public async makeDirectory(path: string) {
		if (this.baseHandle === null) {
			return
		}
	}

	public async exists(path: string): Promise<boolean> {
		return false
	}
}
