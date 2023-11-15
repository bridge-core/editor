import { BaseEntry, BaseFileSystem } from './BaseFileSystem'
import { get, keys, set } from 'idb-keyval'

export class LocalFileSystem extends BaseFileSystem {
	private rootName: string | null = null

	public setRootName(name: string) {
		this.rootName = name
	}

	public async writeFile(path: string, content: FileSystemWriteChunkType) {
		if (this.rootName === null) throw new Error('Root name not set')

		await set(`localFileSystem/${this.rootName}/${path}`, {
			kind: 'file',
			content,
		})
	}

	public async makeDirectory(path: string) {
		if (this.rootName === null) throw new Error('Root name not set')

		await set(`localFileSystem/${this.rootName}/${path}`, {
			kind: 'directory',
		})
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
