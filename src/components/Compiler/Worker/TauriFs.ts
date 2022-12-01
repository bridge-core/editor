import { FileSystem } from 'dash-compiler'
import { IDirEntry } from 'dash-compiler/dist/FileSystem/FileSystem'
import { AnyDirectoryHandle } from '../../FileSystem/Types'
import {
	writeFile,
	writeBinaryFile,
	createDir,
	removeDir,
	removeFile,
	readBinaryFile,
	readDir,
	FileEntry,
	copyFile,
} from '@tauri-apps/api/fs'
import { join, basename, dirname, isAbsolute, relative } from '/@/utils/path'
import json5 from 'json5'

export class TauriBasedDashFileSystem extends FileSystem {
	constructor(protected baseDirectory?: string) {
		super()
	}

	resolvePath(path: string) {
		if (!this.baseDirectory || isAbsolute(path)) return path

		return join(this.baseDirectory, path)
	}
	relative(path: string) {
		if (!this.baseDirectory) return path
		return relative(this.baseDirectory, path)
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
		const binaryData = await readBinaryFile(this.resolvePath(path))

		return new File([binaryData], basename(path))
	}
	async writeFile(path: string, content: string | Uint8Array) {
		const resolvedPath = this.resolvePath(path)
		await createDir(dirname(resolvedPath), { recursive: true })

		if (typeof content === 'string') await writeFile(resolvedPath, content)
		else await writeBinaryFile(resolvedPath, content)
	}
	async copyFile(from: string, to: string, outputFs = this) {
		const outputPath = outputFs.resolvePath(to)
		await createDir(dirname(outputPath), { recursive: true }).catch(
			() => {}
		)

		await copyFile(this.resolvePath(from), outputPath)
	}

	async mkdir(path: string) {
		await createDir(this.resolvePath(path), { recursive: true })
	}
	async unlink(path: string) {
		const resolvedPath = this.resolvePath(path)

		await Promise.all([
			removeDir(resolvedPath, { recursive: true }).catch(() => {}),
			removeFile(resolvedPath).catch(() => {}),
		])
	}
	async allFiles(path: string) {
		const entries = await readDir(this.resolvePath(path), {
			recursive: true,
		})

		return this.flattenEntries(entries)
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
		const entries = await readDir(this.resolvePath(path))

		return entries.map((entry) => ({
			name: entry.name!,
			kind: entry.children ? 'directory' : 'file',
		}))
	}
	async lastModified(filePath: string) {
		return 0
	}
}
