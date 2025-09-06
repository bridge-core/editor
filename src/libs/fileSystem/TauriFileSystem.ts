import { createDir, exists, readBinaryFile, readDir, readTextFile, removeDir, removeFile, writeBinaryFile } from '@tauri-apps/api/fs'
import { BaseEntry, BaseFileSystem } from './BaseFileSystem'
import { join, resolve } from 'pathe'
import { sep } from '@tauri-apps/api/path'
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api'
import * as JSONC from 'jsonc-parser'

export class TauriFileSystem extends BaseFileSystem {
	private basePath: string | null = null
	private textEncoder = new TextEncoder()

	public setBasePath(newPath: string) {
		this.basePath = newPath
	}

	public startFileWatching() {
		listen('watch_event', (event) => {
			if (this.basePath === null) throw new Error('Base path not set!')

			const paths = (event.payload as string[]).map((path) => resolve('/', path.substring(this.basePath!.length)))

			for (const path of paths) {
				this.pathUpdated.dispatch(path)
			}
		})
	}

	public async readFile(path: string): Promise<ArrayBuffer> {
		if (this.basePath === null) throw new Error('Base path not set!')

		try {
			return (await readBinaryFile(join(this.basePath, path))).buffer
		} catch (error) {
			console.error(`Failed to read "${path}"`)

			throw error
		}
	}

	public async readFileText(path: string): Promise<string> {
		if (this.basePath === null) throw new Error('Base path not set!')

		try {
			return await readTextFile(join(this.basePath, path))
		} catch (error) {
			console.error(`Failed to read "${path}"`)

			throw error
		}
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

			return JSONC.parse(content)
		} catch (error) {
			console.error(`Failed to read "${path}"`)

			throw error
		}
	}

	public async writeFile(path: string, content: FileSystemWriteChunkType) {
		if (this.basePath === null) throw new Error('Base path not set!')

		let writeableContent: ArrayBuffer | null = null

		if (typeof content === 'string') {
			writeableContent = this.textEncoder.encode(content)
		}

		if (content instanceof ArrayBuffer) {
			writeableContent = content
		}

		if ((content as ArrayBufferView).buffer) {
			writeableContent = (content as ArrayBufferView).buffer
		}

		if (content instanceof Blob) {
			writeableContent = await content.arrayBuffer()
		}

		if (!writeableContent) throw new Error('Can not convert content to writeable content!')

		try {
			await writeBinaryFile(join(this.basePath, path), writeableContent)
		} catch (error) {
			console.error(`Failed to write "${path}"`)

			throw error
		}
	}

	public async removeFile(path: string) {
		if (this.basePath === null) throw new Error('Base path not set!')

		try {
			await removeFile(join(this.basePath, path))
		} catch (error) {
			console.error(`Failed to remove "${path}"`)

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
			if (await this.exists(path)) return

			await createDir(join(this.basePath, path))
		} catch (error) {
			console.error(`Failed to make directory "${path}"`)

			throw error
		}
	}

	public async ensureDirectory(path: string) {
		if (this.basePath === null) throw new Error('Base path not set!')

		if (await exists(join(this.basePath, path))) return

		try {
			await createDir(join(this.basePath, path), { recursive: true })
		} catch (error) {
			console.error(`Failed to ensure directory "${path}"`)

			throw error
		}
	}

	public async removeDirectory(path: string) {
		if (this.basePath === null) throw new Error('Base path not set!')

		try {
			if (await this.exists(path)) return

			await removeDir(join(this.basePath, path))
		} catch (error) {
			console.error(`Failed to remove directory "${path}"`)

			throw error
		}
	}

	public async readDirectoryEntries(path: string): Promise<BaseEntry[]> {
		if (this.basePath === null) throw new Error('Base path not set!')

		try {
			return (await readDir(join(this.basePath, path))).map(
				(entry) =>
					new BaseEntry(
						entry.path.substring(this.basePath?.length ?? 0).replaceAll(sep, '/'),
						(entry.children !== undefined ? 'directory' : 'file') as 'directory' | 'file'
					)
			)
		} catch (error) {
			console.error(`Failed to read directory "${path}"`)

			throw error
		}
	}

	public async watch(path: string) {
		invoke('watch', { path: join(this.basePath, path) })
	}

	public async unwatch(path: string) {
		invoke('unwatch', { path: join(this.basePath, path) })
	}

	public async revealInFileExplorer(path: string) {
		await invoke('reveal_in_file_explorer', {
			path: join(this.basePath, path),
		})
	}
}
