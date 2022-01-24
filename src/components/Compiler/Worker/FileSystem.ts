import { FileSystem } from 'dash-compiler'
import { IDirEntry } from 'dash-compiler/dist/FileSystem/FileSystem'
import { AnyDirectoryHandle } from '../../FileSystem/Types'
import { FileSystem as BridgeFileSystem } from '/@/components/FileSystem/FileSystem'

export class DashFileSystem extends FileSystem {
	protected internalFs: BridgeFileSystem

	constructor(baseDirectory: AnyDirectoryHandle) {
		super()
		this.internalFs = new BridgeFileSystem(baseDirectory)
	}

	get internal() {
		return this.internalFs
	}

	readJson(path: string) {
		return this.internalFs.readJSON(path)
	}
	async writeJson(path: string, content: any, beautify?: boolean) {
		await this.internalFs.writeJSON(path, content, beautify)
	}
	readFile(path: string): Promise<File> {
		return this.internalFs.readFile(path)
	}
	async writeFile(path: string, content: string | Uint8Array) {
		await this.internalFs.writeFile(path, content)
	}

	mkdir(path: string) {
		return this.internalFs.mkdir(path)
	}
	unlink(path: string) {
		return this.internalFs.unlink(path)
	}
	async allFiles(path: string) {
		return (await this.internalFs.readFilesFromDir(path)).map(
			(file) => file.path
		)
	}
	async readdir(path: string): Promise<IDirEntry[]> {
		return this.internalFs.readdir(path, { withFileTypes: true })
	}
	async lastModified(filePath: string) {
		return 0
	}
}
