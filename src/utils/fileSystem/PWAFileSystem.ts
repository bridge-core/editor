import { BaseFileSystem } from './BaseFileSystem'

export class PWAFileSystem extends BaseFileSystem {
	public baseDirectory: FileSystemDirectoryHandle | null = null

	public async writeFile(path: string, content: FileSystemWriteChunkType) {
		if (this.baseDirectory === null) return

		const handle = await this.baseDirectory.getFileHandle(path, {
			create: true,
		})

		const writable: FileSystemWritableFileStream =
			await handle.createWritable()

		await writable.write(content)

		await writable.close()
	}
}
