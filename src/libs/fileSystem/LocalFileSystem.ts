import { resolve } from 'pathe'
import { BaseFileSystem } from './BaseFileSystem'
import { del, get, keys, set } from 'idb-keyval'

export class LocalFileSystem extends BaseFileSystem {
	private textDecoder = new TextDecoder()

	private rootName: string | null = null

	private pathsToWatch: string[] = []

	public setRootName(name: string) {
		this.rootName = name
	}

	public async readFile(path: string): Promise<ArrayBuffer> {
		if (this.rootName === null) throw new Error('Root name not set')

		path = resolve('/', path)

		return new Uint8Array((await get(`localFileSystem/${this.rootName}${path}`)).content)
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

		return JSON.parse(await this.readFileText(path))
	}

	public async writeFile(path: string, content: FileSystemWriteChunkType) {
		if (this.rootName === null) throw new Error('Root name not set')

		path = resolve('/', path)

		await set(`localFileSystem/${this.rootName}${path}`, {
			kind: 'file',
			content,
		})

		if (this.pathsToWatch.find((watchPath) => path.startsWith(watchPath)) !== undefined)
			this.pathUpdated.dispatch(path)
	}

	public async removeFile(path: string) {
		if (this.rootName === null) throw new Error('Root name not set')

		path = resolve('/', path)

		await del(`localFileSystem/${this.rootName}${path}`)

		if (this.pathsToWatch.find((watchPath) => path.startsWith(watchPath)) !== undefined)
			this.pathUpdated.dispatch(path)
	}

	public async makeDirectory(path: string) {
		if (this.rootName === null) throw new Error('Root name not set')

		path = resolve('/', path)

		await set(`localFileSystem/${this.rootName}${path}`, {
			kind: 'directory',
		})

		if (this.pathsToWatch.find((watchPath) => path.startsWith(watchPath)) !== undefined)
			this.pathUpdated.dispatch(path)
	}

	public async removeDirectory(path: string) {
		if (this.rootName === null) throw new Error('Root name not set')

		path = resolve('/', path)

		await del(`localFileSystem/${this.rootName}${path}`)

		if (this.pathsToWatch.find((watchPath) => path.startsWith(watchPath)) !== undefined)
			this.pathUpdated.dispatch(path)
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

	public async watch(path: string) {
		path = resolve('/', path)

		this.pathsToWatch.push(path)
	}

	public async unwatch(path: string) {
		path = resolve('/', path)

		this.pathsToWatch.splice(this.pathsToWatch.indexOf(path), 1)
	}
}
