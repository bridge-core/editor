import { basename, parse, resolve, sep } from 'pathe'
import { BaseEntry, BaseFileSystem } from './BaseFileSystem'
import { del, get, keys, set } from 'idb-keyval'
import * as JSONC from 'jsonc-parser'

export class LocalFileSystem extends BaseFileSystem {
	private textEncoder = new TextEncoder()
	private textDecoder = new TextDecoder()

	private rootName: string | null = null

	private pathsToWatch: string[] = []

	public setRootName(name: string) {
		this.rootName = name
	}

	public async readFile(path: string): Promise<ArrayBuffer> {
		if (this.rootName === null) throw new Error('Root name not set')

		path = resolve('/', path)

		const data = (await get(`localFileSystem/${this.rootName}${path}`)).content

		if (data instanceof Uint8Array) return data.buffer

		return this.textEncoder.encode(data).buffer
	}

	public async readFileText(path: string): Promise<string> {
		if (this.rootName === null) throw new Error('Root name not set')

		path = resolve('/', path)

		try {
			const content = (await get(`localFileSystem/${this.rootName}${path}`)).content

			if (typeof content === 'string') return content

			return this.textDecoder.decode(new Uint8Array(content))
		} catch (error) {
			console.error(`Failed to read file text "${path}"`)

			throw error
		}
	}

	public async readFileJson(path: string): Promise<any> {
		path = resolve('/', path)

		return JSONC.parse(await this.readFileText(path))
	}

	public async readFileDataUrl(path: string): Promise<string> {
		if (this.rootName === null) throw new Error('Root name not set')

		path = resolve('/', path)

		try {
			const content = (await get(`localFileSystem/${this.rootName}${path}`)).content

			if (typeof content === 'string') throw new Error('Reading string as Data Url is not supported yet!')

			const file = new File([new Blob([new Uint8Array(content)])], basename(path))

			const reader = new FileReader()

			return new Promise((resolve) => {
				reader.onload = () => {
					resolve(reader.result as string)
				}

				reader.readAsDataURL(file)
			})
		} catch (error) {
			console.error(`Failed to read file as data Url "${path}"`)

			throw error
		}
	}

	public async writeFile(path: string, content: FileSystemWriteChunkType) {
		if (this.rootName === null) throw new Error('Root name not set')

		path = resolve('/', path)

		await set(`localFileSystem/${this.rootName}${path}`, {
			kind: 'file',
			content,
		})

		if (
			this.pathsToWatch.find((watchPath) => path.startsWith(watchPath)) !== undefined &&
			this.watchPathsToIgnore.find((watchPath) => path.startsWith(watchPath)) === undefined
		)
			this.pathUpdated.dispatch(path)
	}

	public async removeFile(path: string) {
		if (this.rootName === null) throw new Error('Root name not set')

		path = resolve('/', path)

		await del(`localFileSystem/${this.rootName}${path}`)

		if (
			this.pathsToWatch.find((watchPath) => path.startsWith(watchPath)) !== undefined &&
			this.watchPathsToIgnore.find((watchPath) => path.startsWith(watchPath)) === undefined
		)
			this.pathUpdated.dispatch(path)
	}

	public async makeDirectory(path: string) {
		if (this.rootName === null) throw new Error('Root name not set')

		path = resolve('/', path)

		await set(`localFileSystem/${this.rootName}${path}`, {
			kind: 'directory',
		})

		if (
			this.pathsToWatch.find((watchPath) => path.startsWith(watchPath)) !== undefined &&
			this.watchPathsToIgnore.find((watchPath) => path.startsWith(watchPath)) === undefined
		)
			this.pathUpdated.dispatch(path)
	}

	public async removeDirectory(path: string) {
		if (this.rootName === null) throw new Error('Root name not set')

		path = resolve('/', path)

		await del(`localFileSystem/${this.rootName}${path}`)

		if (
			this.pathsToWatch.find((watchPath) => path.startsWith(watchPath)) !== undefined &&
			this.watchPathsToIgnore.find((watchPath) => path.startsWith(watchPath)) === undefined
		)
			this.pathUpdated.dispatch(path)
	}

	public async ensureDirectory(path: string): Promise<void> {
		if (this.rootName === null) throw new Error('Root name not set')

		path = resolve('/', path)

		const directoryNames = parse(path).dir.split(sep)

		if (directoryNames[0] === '' || directoryNames[0] === '.') directoryNames.shift()

		let currentPath = ''
		for (const directoryName of directoryNames) {
			currentPath += '/' + directoryName

			if (!(await this.exists(currentPath))) await this.makeDirectory(currentPath)
		}
	}

	public async exists(path: string): Promise<boolean> {
		if (this.rootName === null) throw new Error('Root name not set')

		path = resolve('/', path)

		return (await get(`localFileSystem/${this.rootName}${path}`)) !== undefined
	}

	public async allEntries(): Promise<string[]> {
		if (this.rootName === null) throw new Error('Root name not set')

		const allKeys = await keys()
		const localFSKeys = allKeys
			.map((key) => key.toString())
			.filter((key) => key.startsWith(`localFileSystem/${this.rootName}/`))
			.map((key) => key.substring(`localFileSystem/${this.rootName}`.length))

		return localFSKeys
	}

	public async readDirectoryEntries(path: string): Promise<BaseEntry[]> {
		if (this.rootName === null) throw new Error('Root name not set')

		path = resolve('/', path)

		const allEntries = await this.allEntries()

		const entries = allEntries.filter((entry) => parse(entry).dir === path)

		return Promise.all(
			entries.map(async (entryPath) => {
				const entry = await get(`localFileSystem/${this.rootName}${entryPath}`)

				return {
					path: entryPath,
					kind: entry.kind,
				}
			})
		)
	}

	public async watch(path: string) {
		path = resolve('/', path)

		this.pathsToWatch.push(path)
	}

	public async unwatch(path: string) {
		path = resolve('/', path)

		this.pathsToWatch.splice(this.pathsToWatch.indexOf(path), 1)
	}
}
