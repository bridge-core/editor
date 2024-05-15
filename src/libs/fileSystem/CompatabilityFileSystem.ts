import { FileSystem } from 'dash-compiler'
import { BaseFileSystem } from './BaseFileSystem'
import { basename, join, sep } from 'pathe'

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
		let currentPath = ''

		const pathSlices = path.split(sep)
		for (const piece of pathSlices.slice(0, pathSlices.length - 1)) {
			currentPath = join(currentPath, piece)

			if (!(await this.fileSystem.exists(currentPath))) await this.fileSystem.makeDirectory(currentPath)
		}

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
		if (!(await this.fileSystem.exists(path))) return []

		return (await this.fileSystem.readDirectoryEntries(path)).map((entry) => {
			return {
				name: basename(entry.path),
				kind: entry.type,
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
