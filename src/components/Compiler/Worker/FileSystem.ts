import { FileSystem } from '@bridge-editor/dash-compiler'
import { IDirEntry } from '@bridge-editor/dash-compiler/dist/FileSystem/FileSystem'
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
	async readFile(path: string): Promise<File> {
		const file = await this.internalFs.readFile(path)
		return file.isVirtual ? await file.toBlobFile() : file
	}
	async writeFile(path: string, content: string | Uint8Array) {
		await this.internalFs.writeFile(path, content)
	}
	// async copyFile(from: string, to: string, outputFs = this) {
	// 	const [fromHandle, toHandle] = await Promise.all([
	// 		this.internalFs.getFileHandle(from),
	// 		outputFs.internalFs.getFileHandle(to, true),
	// 	])

	// 	const [writable, fromFile] = await Promise.all([
	// 		toHandle.createWritable({ keepExistingData: true }),
	// 		fromHandle.getFile(),
	// 	])

	// 	await writable.write(fromFile)
	// 	await writable.close()
	// }

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
	readdir(path: string): Promise<IDirEntry[]> {
		return this.internalFs.readdir(path, { withFileTypes: true })
	}
	async lastModified(filePath: string) {
		return 0
	}
}
