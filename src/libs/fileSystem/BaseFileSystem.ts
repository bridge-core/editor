import { basename, dirname, extname, join } from 'pathe'
import { Event } from '@/libs/event/Event'

export class BaseFileSystem {
	public pathUpdated: Event<string> = new Event()

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

	public async writeFileJson(path: string, content: object, prettify: boolean) {
		if (prettify) {
			await this.writeFile(path, JSON.stringify(content, null, '\t'))
		} else {
			await this.writeFile(path, JSON.stringify(content))
		}
	}

	public async writeFileStreaming(path: string, stream: StreamableLike) {
		throw new Error('Not implemented!')
	}

	public async removeFile(path: string) {
		throw new Error('Not implemented!')
	}

	public async copyFile(path: string, newPath: string) {
		const contents = await this.readFile(path)

		await this.writeFile(newPath, contents)
	}

	public async readDirectoryEntries(path: string): Promise<BaseEntry[]> {
		throw new Error('Not implemented!')
	}

	public async getEntry(path: string): Promise<BaseEntry> {
		path = this.resolvePath(path)

		try {
			const entries = await this.readDirectoryEntries(dirname(path))

			const entry = entries.find((entry) => entry.path === path)

			if (!entry) throw new Error('Entry does not exist')

			return entry
		} catch (error) {
			console.error(`Failed to get entry "${path}"`)

			throw error
		}
	}

	public async ensureDirectory(path: string) {
		throw new Error('Not implemented!')
	}

	public async makeDirectory(path: string) {
		throw new Error('Not implemented!')
	}

	public async removeDirectory(path: string) {
		throw new Error('Not implemented!')
	}

	public async move(path: string, newPath: string) {
		const entry = await this.getEntry(path)

		if (entry.kind === 'directory') {
			await this.copyDirectory(path, newPath)
			await this.removeDirectory(path)
		} else {
			await this.copyFile(path, newPath)
			await this.removeFile(path)
		}
	}

	public async copyDirectory(path: string, newPath: string) {
		await this.makeDirectory(newPath)

		for (const entry of await this.readDirectoryEntries(path)) {
			if (entry.kind === 'file') {
				await this.copyFile(entry.path, join(newPath, basename(entry.path)))
			}

			if (entry.kind === 'directory') {
				await this.copyDirectory(entry.path, join(newPath, basename(entry.path)))
			}
		}
	}

	public async exists(path: string): Promise<boolean> {
		throw new Error('Not implemented!')
	}

	public async watch(path: string) {
		throw new Error('Not implemented!')
	}

	public async unwatch(path: string) {
		throw new Error('Not implemented!')
	}

	public async findSuitableFileName(targetPath: string) {
		const entries = await this.readDirectoryEntries(dirname(targetPath))
		const fileExt = extname(targetPath)
		let newPath = targetPath

		while (entries.find((entry) => entry.path === newPath + fileExt)) {
			if (!newPath.includes(' copy')) {
				// 1. Add "copy" to the end of the name
				newPath = `${newPath} copy`
			} else {
				// 2. Add a number to the end of the name
				const number = parseInt(newPath.match(/copy (\d+)/)?.[1] ?? '1')
				newPath = newPath.replace(/ \d+$/, '') + ` ${number + 1}`
			}
		}

		return newPath + fileExt
	}

	public async findSuitableFolderName(targetPath: string) {
		const entries = await this.readDirectoryEntries(dirname(targetPath))
		let newPath = targetPath

		while (entries.find((entry) => entry.path === newPath)) {
			if (!newPath.includes(' copy')) {
				// 1. Add "copy" to the end of the name
				newPath = `${newPath} copy`
			} else {
				// 2. Add a number to the end of the name
				const number = parseInt(newPath.match(/copy (\d+)/)?.[1] ?? '1')
				newPath = newPath.replace(/ \d+$/, '') + ` ${number + 1}`
			}
		}

		return newPath
	}

	protected resolvePath(path: string): string {
		return path
	}
}

export type StreamableLike = {
	ondata: (err: any | null, data: Uint8Array, final: boolean) => void
	start?: () => void
}

export class BaseEntry {
	constructor(public path: string, public kind: 'file' | 'directory') {}
}
