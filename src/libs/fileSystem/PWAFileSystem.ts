import { sep, parse, basename } from '/@/libs/path'
import { BaseEntry, BaseFileSystem } from './BaseFileSystem'
import { Ref, onMounted, onUnmounted, ref } from 'vue'

export class PWAFileSystem extends BaseFileSystem {
	public baseHandle: FileSystemDirectoryHandle | null = null

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
		if (directoryNames[0] === '' || directoryNames[0] === '.')
			directoryNames.shift()

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

		try {
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
		} catch (error) {
			console.error(`Failed to read "${path}"`)

			throw error
		}
	}

	public async readFileJson(path: string): Promise<any> {
		if (this.baseHandle === null) throw new Error('Base handle not set!')

		try {
			const handle = await (
				await this.traverse(path)
			).getFileHandle(basename(path))

			const file = await handle.getFile()

			const reader = new FileReader()

			return new Promise((resolve) => {
				reader.onload = () => {
					resolve(JSON.parse(reader.result as string))
				}

				reader.readAsText(file)
			})
		} catch (error) {
			console.error(`Failed to read "${path}"`)

			throw error
		}
	}

	public async readFileDataUrl(path: string): Promise<string> {
		if (this.baseHandle === null) throw new Error('Base handle not set!')

		try {
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
		} catch (error) {
			console.error(`Failed to read "${path}"`)

			throw error
		}
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

			this.eventSystem.dispatch('updated', path)
		} catch (error) {
			console.error(`Failed to write "${path}"`, error)
		}
	}

	public async writeFileJson(
		path: string,
		content: object,
		prettify: boolean
	) {
		if (prettify) {
			await this.writeFile(path, JSON.stringify(content, null, '\t'))
		} else {
			await this.writeFile(path, JSON.stringify(content))
		}
	}

	public async readDirectoryEntries(path: string): Promise<BaseEntry[]> {
		if (this.baseHandle === null) throw new Error('Base handle not set!')

		try {
			const handle =
				path === '/'
					? this.baseHandle
					: await (
							await this.traverse(path)
					  ).getDirectoryHandle(basename(path))
			const handleEntries = handle.entries()

			const entries = []

			for await (const handleEntry of handleEntries) {
				entries.push(new BaseEntry(handleEntry[0], handleEntry[1].kind))
			}

			return entries
		} catch (error) {
			console.error(`Failed to read directory entries of "${path}"`)

			throw error
		}
	}

	public async makeDirectory(path: string) {
		if (this.baseHandle === null) throw new Error('Base handle not set!')

		try {
			const rootHandle = await await this.traverse(path)

			await rootHandle.getDirectoryHandle(basename(path), {
				create: true,
			})

			this.eventSystem.dispatch('updated', path)
		} catch (error) {
			console.error(`Failed to make directory "${path}"`)

			throw error
		}
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

	public async ensurePermissions(
		handle: FileSystemDirectoryHandle | FileSystemFileHandle
	): Promise<boolean> {
		if ((await handle.queryPermission({ mode: 'readwrite' })) === 'granted')
			return true

		try {
			if (
				(await handle.requestPermission({ mode: 'readwrite' })) ===
				'granted'
			)
				return true
		} catch {}

		return false
	}

	public useSetup(): Ref<boolean> {
		const setup = ref(this.setup)

		const me = this

		function updatedFileSystem() {
			setup.value = me.setup
		}

		onMounted(() => me.eventSystem.on('reloaded', updatedFileSystem))
		onUnmounted(() => me.eventSystem.off('reloaded', updatedFileSystem))

		return setup
	}
}
