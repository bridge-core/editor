import { basename, parse, resolve, sep } from 'pathe'
import { BaseEntry, BaseFileSystem, StreamableLike } from './BaseFileSystem'
import * as JSONC from 'jsonc-parser'

export class MemoryFileSystem extends BaseFileSystem {
	private textEncoder = new TextEncoder()
	private textDecoder = new TextDecoder()

	private pathsToWatch: string[] = []

	private data: Record<string, { kind: 'file'; content: FileSystemWriteChunkType } | { kind: 'directory' }> = {}

	public async readFile(path: string): Promise<ArrayBuffer> {
		path = resolve('/', path)

		const entry = this.data[path]

		if (entry.kind === 'directory') throw new Error(`Can not call read on a directory! ${path}`)

		const data = entry.content

		// @ts-ignore TS being weird about errors
		if (data instanceof Uint8Array) return data.buffer

		if (data instanceof ArrayBuffer) return data

		return this.textEncoder.encode(data as string).buffer
	}

	public async readFileText(path: string): Promise<string> {
		path = resolve('/', path)

		const entry = this.data[path]

		if (entry.kind === 'directory') throw new Error(`Can not call read on a directory! ${path}`)

		try {
			const content = entry.content

			if (typeof content === 'string') return content

			return this.textDecoder.decode(new Uint8Array(content as ArrayBuffer))
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
		path = resolve('/', path)

		const entry = this.data[path]

		if (entry.kind === 'directory') throw new Error(`Can not call read on a directory! ${path}`)

		try {
			const content = entry.content

			if (typeof content === 'string') throw new Error('Reading string as Data Url is not supported yet!')

			const file = new File([new Blob([new Uint8Array(content as ArrayBuffer)])], basename(path))

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
		path = resolve('/', path)

		this.data[path] = {
			kind: 'file',
			content,
		}

		if (
			this.pathsToWatch.find((watchPath) => path.startsWith(watchPath)) !== undefined &&
			this.watchPathsToIgnore.find((watchPath) => path.startsWith(watchPath)) === undefined
		)
			this.pathUpdated.dispatch(path)
	}

	public async writeFileStreaming(path: string, stream: StreamableLike) {
		path = resolve('/', path)

		const chunks: Uint8Array[] = []
		let totalLength = 0

		await new Promise<void>((resolve) => {
			stream.ondata = (error, data, final) => {
				chunks.push(data)
				totalLength += data.length

				if (final) resolve()
			}

			stream.start()
		})

		const content = new Uint8Array(totalLength)
		let writePosition = 0

		for (const chunk of chunks) {
			content.set(chunk, writePosition)

			writePosition += chunk.length
		}

		this.data[path] = {
			kind: 'file',
			content,
		}

		if (
			this.pathsToWatch.find((watchPath) => path.startsWith(watchPath)) !== undefined &&
			this.watchPathsToIgnore.find((watchPath) => path.startsWith(watchPath)) === undefined
		)
			this.pathUpdated.dispatch(path)
	}

	public async removeFile(path: string) {
		path = resolve('/', path)

		delete this.data[path]

		if (
			this.pathsToWatch.find((watchPath) => path.startsWith(watchPath)) !== undefined &&
			this.watchPathsToIgnore.find((watchPath) => path.startsWith(watchPath)) === undefined
		)
			this.pathUpdated.dispatch(path)
	}

	public async makeDirectory(path: string) {
		path = resolve('/', path)

		this.data[path] = {
			kind: 'directory',
		}

		if (
			this.pathsToWatch.find((watchPath) => path.startsWith(watchPath)) !== undefined &&
			this.watchPathsToIgnore.find((watchPath) => path.startsWith(watchPath)) === undefined
		)
			this.pathUpdated.dispatch(path)
	}

	public async removeDirectory(path: string) {
		path = resolve('/', path)

		delete this.data[path]

		if (
			this.pathsToWatch.find((watchPath) => path.startsWith(watchPath)) !== undefined &&
			this.watchPathsToIgnore.find((watchPath) => path.startsWith(watchPath)) === undefined
		)
			this.pathUpdated.dispatch(path)
	}

	public async ensureDirectory(path: string): Promise<void> {
		path = resolve('/', path)

		if (parse(path).dir === '/') return

		const directoryNames = parse(path).dir.split(sep).slice(1)

		let currentPath = ''
		for (const directoryName of directoryNames) {
			currentPath += '/' + directoryName

			if (!(await this.exists(currentPath))) await this.makeDirectory(currentPath)
		}
	}

	public async exists(path: string): Promise<boolean> {
		path = resolve('/', path)

		return this.data[path] !== undefined
	}

	public async allEntries(): Promise<string[]> {
		return Object.keys(this.data)
	}

	public async readDirectoryEntries(path: string): Promise<BaseEntry[]> {
		path = resolve('/', path)

		const allEntries = await this.allEntries()

		const entries = allEntries.filter((entry) => parse(entry).dir === path && entry !== path)

		return Promise.all(
			entries.map(async (entryPath) => {
				const entry = this.data[entryPath]

				return new BaseEntry(entryPath, entry.kind)
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
