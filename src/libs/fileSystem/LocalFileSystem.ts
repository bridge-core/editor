import { BaseFileSystem } from './BaseFileSystem'
import { get, keys, set } from 'idb-keyval'

export class LocalFileSystem extends BaseFileSystem {
	private textDecoder = new TextDecoder()

	private rootName: string | null = null

	public setRootName(name: string) {
		this.rootName = name
	}

	public async readFile(path: string): Promise<ArrayBuffer> {
		if (this.rootName === null) throw new Error('Root name not set')

		return new Uint8Array(
			(await get(`localFileSystem/${this.rootName}/${path}`)).content
		)
	}

	public async readFileText(path: string): Promise<string> {
		if (this.rootName === null) throw new Error('Root name not set')

		const content = (await get(`localFileSystem/${this.rootName}/${path}`))
			.content

		if (typeof content === 'string') return content

		return this.textDecoder.decode(new Uint8Array(content))
	}

	public async readFileJson(path: string): Promise<any> {
		return JSON.parse(await this.readFileText(path))
	}

	public async writeFile(path: string, content: FileSystemWriteChunkType) {
		if (this.rootName === null) throw new Error('Root name not set')

		await set(`localFileSystem/${this.rootName}/${path}`, {
			kind: 'file',
			content,
		})
	}

	public async writeFileJson(
		path: string,
		content: object,
		prettify: boolean
	) {
		if (this.rootName === null) throw new Error('Root name not set')

		if (prettify) {
			await this.writeFile(
				path,
				JSON.stringify(content, null, prettify ? '\t' : undefined)
			)
		} else {
			await this.writeFile(path, JSON.stringify(content))
		}
	}

	public async makeDirectory(path: string) {
		if (this.rootName === null) throw new Error('Root name not set')

		await set(`localFileSystem/${this.rootName}/${path}`, {
			kind: 'directory',
		})
	}

	public async exists(path: string): Promise<boolean> {
		if (this.rootName === null) throw new Error('Root name not set')

		return (
			(await get(`localFileSystem/${this.rootName}/${path}`)) !==
			undefined
		)
	}

	public async allEntries(): Promise<string[]> {
		if (this.rootName === null) throw new Error('Root name not set')

		const allKeys = await keys()
		const localFSKeys = allKeys
			.map((key) => key.toString())
			.filter((key) =>
				key.startsWith(`localFileSystem/${this.rootName}/`)
			)

		return localFSKeys
	}
}
