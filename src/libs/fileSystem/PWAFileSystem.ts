import { sep, parse, basename, join } from '@/libs/path'
import { BaseEntry, BaseFileSystem } from './BaseFileSystem'
import { Ref, onMounted, onUnmounted, ref } from 'vue'
import { md5 } from 'js-md5'
import { dirname } from 'path'

export class PWAFileSystem extends BaseFileSystem {
	public baseHandle: FileSystemDirectoryHandle | null = null

	private cache: { [key: string]: string } = {}

	public get setup(): boolean {
		return this.baseHandle !== null
	}

	public setBaseHandle(handle: FileSystemDirectoryHandle) {
		this.baseHandle = handle

		this.eventSystem.dispatch('reloaded', null)
	}

	public async startCache() {
		await this.indexPath('/')

		setInterval(() => {
			this.checkForUpdate('/')
		}, 1000)

		// window.addEventListener('keydown', (event) => {
		// 	if (event.key === '`') {
		// 		this.checkForUpdate('/')
		// 	}
		// })
	}

	protected async traverse(path: string): Promise<FileSystemDirectoryHandle> {
		if (!this.baseHandle) throw new Error('Base handle not set!')

		const directoryNames = parse(path).dir.split(sep)

		if (directoryNames[0] === '' || directoryNames[0] === '.') directoryNames.shift()

		let currentHandle = this.baseHandle

		for (const directoryName of directoryNames) {
			if (directoryName === '') continue

			currentHandle = await currentHandle.getDirectoryHandle(directoryName)
		}

		return currentHandle
	}

	public async readFile(path: string): Promise<ArrayBuffer> {
		if (this.baseHandle === null) throw new Error('Base handle not set!')

		try {
			const handle = await (await this.traverse(path)).getFileHandle(basename(path))

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
			const handle = await (await this.traverse(path)).getFileHandle(basename(path))

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

	public async readFileText(path: string): Promise<string> {
		if (this.baseHandle === null) throw new Error('Base handle not set!')

		try {
			const handle = await (await this.traverse(path)).getFileHandle(basename(path))

			const file = await handle.getFile()

			const reader = new FileReader()

			return new Promise((resolve) => {
				reader.onload = () => {
					resolve(reader.result as string)
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
			const handle = await (await this.traverse(path)).getFileHandle(basename(path))

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

			const writable: FileSystemWritableFileStream = await handle.createWritable()

			await writable.write(content)
			await writable.close()
		} catch (error) {
			console.error(`Failed to write "${path}"`, error)
		}
	}

	public async removeFile(path: string) {
		if (this.baseHandle === null) throw new Error('Base handle not set!')

		try {
			const baseHandle = await await this.traverse(path)

			await baseHandle.removeEntry(basename(path))
		} catch (error) {
			console.error(`Failed to remove "${path}"`, error)
		}
	}

	public async ensureDirectory(path: string) {
		if (this.baseHandle === null) throw new Error('Base handle not set!')

		try {
			const directoryNames = parse(path).dir.split(sep)

			if (directoryNames[0] === '' || directoryNames[0] === '.') directoryNames.shift()

			let currentHandle = this.baseHandle

			for (const directoryName of directoryNames) {
				if (directoryName === '') continue

				currentHandle = await currentHandle.getDirectoryHandle(directoryName, {
					create: true,
				})
			}
		} catch (error) {
			console.error(`Failed to ensure directory "${path}"`)

			throw error
		}
	}

	public async readDirectoryEntries(path: string): Promise<BaseEntry[]> {
		if (this.baseHandle === null) throw new Error('Base handle not set!')

		try {
			const handle =
				path === '/' ? this.baseHandle : await (await this.traverse(path)).getDirectoryHandle(basename(path))
			const handleEntries = handle.entries()

			const entries = []

			for await (const handleEntry of handleEntries) {
				if (handleEntry[0].endsWith('.crswap')) continue

				entries.push(new BaseEntry(join(path, handleEntry[0]), handleEntry[1].kind))
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
		} catch (error) {
			console.error(`Failed to make directory "${path}"`)

			throw error
		}
	}

	public async removeDirectory(path: string) {
		if (this.baseHandle === null) throw new Error('Base handle not set!')

		try {
			const rootHandle = await await this.traverse(path)

			rootHandle.removeEntry(basename(path), {
				recursive: true,
			})
		} catch (error) {
			console.error(`Failed to remove directory "${path}"`)

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
			let newHandle: FileSystemDirectoryHandle | FileSystemFileHandle | null = null

			for await (const entry of entries) {
				if (entry[0] !== name) continue

				newHandle = entry[1]

				break
			}

			if (newHandle === null) return false

			if (nameIndex < itemNames.length - 1 && newHandle.kind !== 'directory') return false

			if (nameIndex === itemNames.length - 1) return true

			currentHandle = <FileSystemDirectoryHandle>newHandle
		}

		return true
	}

	public async hasPermissions(handle: FileSystemDirectoryHandle | FileSystemFileHandle): Promise<boolean> {
		if ((await handle.queryPermission({ mode: 'readwrite' })) === 'granted') return true

		return false
	}

	public async ensurePermissions(handle: FileSystemDirectoryHandle | FileSystemFileHandle): Promise<boolean> {
		if ((await handle.queryPermission({ mode: 'readwrite' })) === 'granted') return true

		try {
			if ((await handle.requestPermission({ mode: 'readwrite' })) === 'granted') return true
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

	private async generateFileHash(path: string): Promise<string> {
		const hash = md5.create()
		hash.update(await this.readFile(path))

		return hash.hex()
	}

	private async indexPath(path: string) {
		const entries = await this.readDirectoryEntries(path)

		let hash = ''

		for (const entry of entries) {
			hash += entry.path + '\n'

			if (entry.type === 'file') this.cache[entry.path] = await this.generateFileHash(entry.path)

			if (entry.type === 'directory') await this.indexPath(entry.path)
		}

		this.cache[path] = hash
	}

	private async checkForUpdate(path: string) {
		const entries = await this.readDirectoryEntries(path)

		let hash = ''

		for (const entry of entries) {
			hash += entry.path + '\n'

			if (entry.type === 'file') {
				let fileHash = await this.generateFileHash(entry.path)

				if (this.cache[entry.path] !== fileHash)
					this.eventSystem.dispatch(
						'pathUpdated',
						entry.path.startsWith('/') ? entry.path.substring(1) : entry.path
					)

				this.cache[entry.path] = fileHash
			}

			if (entry.type === 'directory') await this.checkForUpdate(entry.path)
		}

		if (this.cache[path] !== hash) {
			const previousPaths = (this.cache[path] ?? '').split('\n').filter((path) => path.length > 0)
			const newPaths = hash.split('\n').filter((path) => path.length > 0)

			for (const previousPath of previousPaths) {
				if (!newPaths.includes(previousPath))
					this.eventSystem.dispatch(
						'pathUpdated',
						previousPath.startsWith('/') ? previousPath.substring(1) : previousPath
					)
			}

			for (const newPath of newPaths) {
				if (!previousPaths.includes(newPath))
					this.eventSystem.dispatch('pathUpdated', newPath.startsWith('/') ? newPath.substring(1) : newPath)
			}

			this.eventSystem.dispatch('pathUpdated', path)
		}

		this.cache[path] = hash
	}
}
