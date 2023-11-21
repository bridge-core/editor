import { EventSystem } from '/@/libs/event/EventSystem'

export class BaseFileSystem {
	public eventSystem = new EventSystem(['reloaded', 'updated'])

	public async readFile(path: string): Promise<ArrayBuffer> {
		throw new Error('Not implemented!')
	}

	public async readFileText(path: string): Promise<string> {
		throw new Error('Not implemented!')
	}

	public async readFileDataUrl(path: string): Promise<string> {
		throw new Error('Not implemented!')
	}

	public async readFileJson(path: string): Promise<any> {
		throw new Error('Not implemented!')
	}

	public async writeFile(path: string, content: FileSystemWriteChunkType) {
		throw new Error('Not implemented!')
	}

	public async writeFileJson(
		path: string,
		content: object,
		prettify: boolean
	) {
		throw new Error('Not implemented!')
	}

	public async readDirectoryEntries(path: string): Promise<BaseEntry[]> {
		throw new Error('Not implemented!')
	}

	public async makeDirectory(path: string) {
		throw new Error('Not implemented!')
	}

	public async exists(path: string): Promise<boolean> {
		throw new Error('Not implemented!')
	}
}

export class BaseEntry {
	constructor(public path: string, public type: 'file' | 'directory') {}
}
