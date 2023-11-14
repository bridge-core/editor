import { EventSystem } from '/@/libs/event/EventSystem'

export class BaseFileSystem {
	public eventSystem = new EventSystem(['reloaded'])

	public async writeFile(path: string, content: FileSystemWriteChunkType) {
		throw new Error('Not implemented!')
	}

	public async readFile(path: string): Promise<string> {
		throw new Error('Not implemented!')
	}

	public async readDirectory(path: string): Promise<string[]> {
		throw new Error('Not implemented!')
	}

	public async makeDirectory(path: string) {
		throw new Error('Not implemented!')
	}

	public async exists(path: string): Promise<boolean> {
		throw new Error('Not implemented!')
	}
}
