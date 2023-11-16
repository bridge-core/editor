import { sep, parse, basename } from '/@/libs/path'
import { BaseEntry, BaseFileSystem } from './BaseFileSystem'

export class PWAFileSystem extends BaseFileSystem {
	protected baseHandle: FileSystemDirectoryHandle | null = null

	public get setup(): boolean {
		return this.baseHandle !== null
	}

	public setBaseHandle(handle: FileSystemDirectoryHandle) {
		this.baseHandle = handle

		this.eventSystem.dispatch('reloaded', null)
	}

	protected async traverse(path: string): Promise<FileSystemDirectoryHandle> {
		if (!this.baseHandle) throw new Error('Base handle not set!')

		const directoryNames = parse(path).dir.split(sep)
		if (directoryNames[0] === '') directoryNames.shift()

		let currentHandle = this.baseHandle

		for (const directoryName of directoryNames) {
			if (directoryName === '') continue

			currentHandle = await currentHandle.getDirectoryHandle(
				directoryName
			)
		}

		return currentHandle
	}

	public async readFile(path: string): Promise<ArrayBuffer> {
		if (this.baseHandle === null) throw new Error('Base handle not set!')

		const handle = await (
			await this.traverse(path)
		).getFileHandle(basename(path))

		const file = await handle.getFile()

		const reader = new FileReader()

		return new Promise((resolve) => {
			reader.onload = () => {
				resolve(reader.result as ArrayBuffer)
			}

			reader.readAsArrayBuffer(file)
		})
	}

	public async readFileDataUrl(path: string): Promise<string> {
		if (this.baseHandle === null) throw new Error('Base handle not set!')

		const handle = await (
			await this.traverse(path)
		).getFileHandle(basename(path))
		const file = await handle.getFile()

		const reader = new FileReader()

		return new Promise((resolve) => {
			reader.onload = () => {
				resolve(reader.result as string)
			}

			reader.readAsDataURL(file)
		})
	}

	public async writeFile(path: string, content: FileSystemWriteChunkType) {
		if (this.baseHandle === null) throw new Error('Base handle not set!')

		try {
			const handle = await (
				await this.traverse(path)
			).getFileHandle(basename(path), {
				create: true,
			})

			const writable: FileSystemWritableFileStream =
				await handle.createWritable()

			await writable.write(content)
			await writable.close()
		} catch (error) {
			console.error(`Failed to write "${path}"`, error)
		}
	}

	public async readDirectoryEntries(path: string): Promise<BaseEntry[]> {
		if (this.baseHandle === null) throw new Error('Base handle not set!')

		const handle = await (
			await this.traverse(path)
		).getDirectoryHandle(basename(path))
		const handleEntries = handle.entries()

		const entries = []

		for await (const handleEntry of handleEntries) {
			entries.push(new BaseEntry(handleEntry[0], handleEntry[1].kind))
		}

		return entries
	}

	public async makeDirectory(path: string) {
		if (this.baseHandle === null) throw new Error('Base handle not set!')

		const rootHandle = await await this.traverse(path)

		await rootHandle.getDirectoryHandle(basename(path), {
			create: true,
		})
	}

	public async exists(path: string): Promise<boolean> {
		if (this.baseHandle === null) throw new Error('Base handle not set!')

		const itemNames = path.split(sep)
		if (itemNames[0] === '') itemNames.shift()

		let currentHandle = this.baseHandle

		for (let nameIndex = 0; nameIndex < itemNames.length; nameIndex++) {
			const name = itemNames[nameIndex]

			const entries = await currentHandle.entries()
			let newHandle:
				| FileSystemDirectoryHandle
				| FileSystemFileHandle
				| null = null

			for await (const entry of entries) {
				if (entry[0] !== name) continue

				newHandle = entry[1]

				break
			}

			if (newHandle === null) return false

			if (
				nameIndex < itemNames.length - 1 &&
				newHandle.kind !== 'directory'
			)
				return false

			if (nameIndex === itemNames.length - 1) return true

			currentHandle = <FileSystemDirectoryHandle>newHandle
		}

		return true
	}
}
