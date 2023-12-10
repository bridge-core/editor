import { FileSystem } from 'dash-compiler'
import { BaseFileSystem } from './BaseFileSystem'
import { basename } from '@/libs/path'

export class CompatabilityFileSystem extends FileSystem {
	constructor(public fileSystem: BaseFileSystem) {
		super()
	}

	async readFile(path: string): Promise<File> {
		const content = await this.fileSystem.readFile(path)

		return new CompatabilityFile([new Blob([content])], basename(path))
	}
	async writeFile(path: string, content: string | Uint8Array): Promise<void> {
		console.log('Writing file to ', path)

		await this.fileSystem.writeFile(path, content)
	}
	async unlink(path: string): Promise<void> {
		throw new Error('Method not implemented.')
	}
	async readdir(path: string): Promise<
		{
			name: string
			kind: 'file' | 'directory'
		}[]
	> {
		if (!(await this.fileSystem.exists(path)))
			await this.fileSystem.makeDirectory(path)

		return (await this.fileSystem.readDirectoryEntries(path)).map(
			(entry) => {
				return { name: basename(entry.path), kind: entry.type }
			}
		)
	}
	async mkdir(path: string): Promise<void> {
		throw new Error('Method not implemented.')
	}
	async lastModified(filePath: string): Promise<number> {
		throw new Error('Method not implemented.')
	}
}

export class CompatabilityFile extends File {}
