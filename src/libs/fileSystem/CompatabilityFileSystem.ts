import { FileSystem } from '@bridge-editor/dash-compiler'
import { BaseFileSystem } from './BaseFileSystem'
import { basename, resolve } from 'pathe'

export class CompatabilityFileSystem extends FileSystem {
	constructor(public fileSystem: BaseFileSystem) {
		super()
	}

	async readFile(path: string): Promise<File> {
		const content = await this.fileSystem.readFile(path)

		const file = new File([new Blob([content])], basename(path))

		return file
	}

	async writeFile(path: string, content: string | Uint8Array): Promise<void> {
		await this.fileSystem.ensureDirectory(path)

		await this.fileSystem.writeFile(path, content)
	}

	async unlink(path: string): Promise<void> {
		path = resolve('/', path)

		const entry = await this.fileSystem.getEntry(path)

		if (entry.kind === 'file') {
			await this.fileSystem.removeFile(path)
		} else {
			await this.fileSystem.removeDirectory(path)
		}
	}

	async readdir(path: string): Promise<
		{
			name: string
			kind: 'file' | 'directory'
		}[]
	> {
		if (!(await this.fileSystem.exists(path))) return []

		return (await this.fileSystem.readDirectoryEntries(path)).map((entry) => {
			return {
				name: basename(entry.path),
				kind: entry.kind,
				path: entry.path,
			}
		})
	}

	async mkdir(path: string): Promise<void> {
		throw new Error('Method not implemented.')
	}

	async lastModified(filePath: string): Promise<number> {
		throw new Error('Method not implemented.')
	}
}
