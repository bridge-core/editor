import { FileSystem } from 'dash-compiler'
import { BaseFileSystem } from './BaseFileSystem'
import { basename } from '@/libs/path'

export class CompatabilityFileSystem extends FileSystem {
	constructor(public fileSystem: BaseFileSystem) {
		super()
	}

	async readFile(path: string): Promise<File> {
		console.log('Compatability file system reading file', path)

		const content = await this.fileSystem.readFile(path)

		return new CompatabilityFile([new Blob([content])], basename(path))
	}
	async writeFile(path: string, content: string | Uint8Array): Promise<void> {
		throw new Error('Method not implemented.')
	}
	async unlink(path: string): Promise<void> {
		throw new Error('Method not implemented.')
	}
	async readdir(path: string): Promise<any[]> {
		throw new Error('Method not implemented.')
	}
	async mkdir(path: string): Promise<void> {
		throw new Error('Method not implemented.')
	}
	async lastModified(filePath: string): Promise<number> {
		throw new Error('Method not implemented.')
	}
}

export class CompatabilityFile extends File {}
