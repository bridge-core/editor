import { createDir, exists, readBinaryFile, readDir, readTextFile } from '@tauri-apps/api/fs'
import { BaseEntry, BaseFileSystem } from './BaseFileSystem'
import { join } from '@/libs/path'
import { sep } from '@tauri-apps/api/path'

export class TauriFileSystem extends BaseFileSystem {
	private basePath: string | null = null

	public setBasePath(newPath: string) {
		this.basePath = newPath
	}

	public async readFileDataUrl(path: string): Promise<string> {
		if (this.basePath === null) throw new Error('Base path not set!')

		try {
			const content = await readBinaryFile(join(this.basePath, path))

			const reader = new FileReader()

			return new Promise((resolve) => {
				reader.onload = () => {
					resolve(reader.result as string)
				}

				reader.readAsDataURL(new Blob([content.buffer]))
			})
		} catch (error) {
			console.error(`Failed to read "${path}"`)

			throw error
		}
	}

	public async readFileJson(path: string): Promise<any> {
		if (this.basePath === null) throw new Error('Base path not set!')

		try {
			const content = await readTextFile(join(this.basePath, path))

			return JSON.parse(content)
		} catch (error) {
			console.error(`Failed to read "${path}"`)

			throw error
		}
	}

	public async exists(path: string): Promise<boolean> {
		if (this.basePath === null) throw new Error('Base path not set!')

		return await exists(join(this.basePath, path))
	}

	public async makeDirectory(path: string) {
		if (this.basePath === null) throw new Error('Base path not set!')

		try {
			await createDir(join(this.basePath, path))
		} catch (error) {
			console.error(`Failed to make directory "${path}"`)

			throw error
		}
	}

	public async ensureDirectory(path: string) {
		if (this.basePath === null) throw new Error('Base path not set!')

		try {
			await createDir(join(this.basePath, path), { recursive: true })
		} catch (error) {
			console.error(`Failed to ensure directory "${path}"`)

			throw error
		}
	}

	public async readDirectoryEntries(path: string): Promise<BaseEntry[]> {
		if (this.basePath === null) throw new Error('Base path not set!')

		try {
			return (await readDir(join(this.basePath, path))).map((entry) => {
				return {
					type: (entry.children !== undefined ? 'directory' : 'file') as 'directory' | 'file',
					path: entry.path.substring(this.basePath?.length ?? 0).replaceAll(sep, '/'),
				}
			})
		} catch (error) {
			console.error(`Failed to read directory "${path}"`)

			throw error
		}
	}
}
