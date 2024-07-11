import { FileSystem } from '@bridge-editor/dash-compiler'
import { IDirEntry } from '@bridge-editor/dash-compiler/dist/FileSystem/FileSystem'
import {
	writeFile,
	writeBinaryFile,
	createDir,
	removeDir,
	removeFile,
	readDir,
	FileEntry,
	copyFile,
} from '@tauri-apps/api/fs'
import { join, basename, dirname, isAbsolute, sep } from '@tauri-apps/api/path'
import json5 from 'json5'
import { invoke } from '@tauri-apps/api'

export class TauriBasedDashFileSystem extends FileSystem {
	constructor(protected baseDirectory?: string) {
		super()
	}

	async resolvePath(path: string) {
		path = path.replaceAll(/\\|\//g, sep)
		if (!this.baseDirectory || (await isAbsolute(path))) return path

		return join(this.baseDirectory, path)
	}

	async readJson(path: string) {
		const file = await this.readFile(path)

		return json5.parse(await file.text())
	}
	async writeJson(path: string, content: any, beautify?: boolean) {
		await this.writeFile(
			path,
			JSON.stringify(content, null, beautify ? '\t' : undefined)
		)
	}
	async readFile(path: string): Promise<File> {
		const resolvedPath = await this.resolvePath(path)
		const binaryData = new Uint8Array(
			await invoke<Array<number>>('read_file', {
				path: resolvedPath,
			})
		)

		return new File([binaryData], await basename(path))
	}
	async writeFile(path: string, content: string | Uint8Array) {
		const resolvedPath = await this.resolvePath(path)
		await createDir(await dirname(resolvedPath), { recursive: true })

		if (typeof content === 'string') await writeFile(resolvedPath, content)
		else await writeBinaryFile(resolvedPath, content)
	}
	async copyFile(from: string, to: string, outputFs = this) {
		const outputPath = await outputFs.resolvePath(to)
		await createDir(await dirname(outputPath), { recursive: true }).catch(
			() => {}
		)

		await copyFile(await this.resolvePath(from), outputPath)
	}

	async mkdir(path: string) {
		await createDir(await this.resolvePath(path), { recursive: true })
	}
	async unlink(path: string) {
		const resolvedPath = await this.resolvePath(path)

		await Promise.all([
			removeDir(resolvedPath, { recursive: true }).catch(() => {}),
			removeFile(resolvedPath).catch(() => {}),
		])
	}
	async allFiles(path: string) {
		const entries = await readDir(await this.resolvePath(path), {
			recursive: true,
		})

		return this.flattenEntries(entries)
	}
	protected relative(path: string) {
		if (!this.baseDirectory) return path

		return path
			.replace(`${this.baseDirectory}${sep}`, '')
			.replaceAll('\\', '/') // Dash expects forward slashes
	}
	protected flattenEntries(entries: FileEntry[]) {
		const files: string[] = []

		for (const { path, children } of entries) {
			if (children) {
				files.push(...this.flattenEntries(children))
				continue
			}

			files.push(this.relative(path))
		}

		return files
	}
	async readdir(path: string): Promise<IDirEntry[]> {
		const entries = await readDir(await this.resolvePath(path))

		return entries.map((entry) => ({
			name: entry.name!,
			kind: entry.children ? 'directory' : 'file',
		}))
	}
	async lastModified(filePath: string) {
		return 0
	}
}
