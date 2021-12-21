// @ts-ignore Make "path" work on this worker
globalThis.process = {
	cwd: () => '',
	env: {},
}

import '/@/components/FileSystem/Virtual/Comlink'
import { expose } from 'comlink'
import { FileTypeLibrary, IFileType } from '/@/components/Data/FileType'
import { DataLoader } from '/@/components/Data/DataLoader'
import type { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { Dash } from 'dash-compiler'
import { PackTypeLibrary } from '/@/components/Data/PackType'
import { DashFileSystem } from './FileSystem'
import { Signal } from '/@/components/Common/Event/Signal'

export interface ICompilerOptions {
	config: string
	mode: 'development' | 'production'
	pluginFileTypes: IFileType[]
}

export class DashService {
	protected dataLoader = new DataLoader()
	public fileType: FileTypeLibrary
	protected dash: Dash<DataLoader>
	protected isDashFree = new Signal<void>()

	constructor(
		baseDirectory: AnyDirectoryHandle,
		comMojangDirectory: AnyDirectoryHandle | undefined,
		options: ICompilerOptions
	) {
		const fileSystem = new DashFileSystem(baseDirectory)
		const outputFileSystem = comMojangDirectory
			? new DashFileSystem(comMojangDirectory)
			: undefined
		this.fileType = new FileTypeLibrary()
		this.fileType.setPluginFileTypes(options.pluginFileTypes)
		this.dash = new Dash<DataLoader>(fileSystem, outputFileSystem, {
			config: options.config,
			mode: options.mode,
			fileType: this.fileType,
			packType: new PackTypeLibrary(),
			requestJsonData: (path) => this.dataLoader.readJSON(path),
		})
	}

	async compileFile(filePath: string, fileContent: Uint8Array) {
		await this.isDashFree.fired
		this.isDashFree.resetSignal()

		let data = this.dash.compileFile(filePath, fileContent)
		this.isDashFree.dispatch()
		return data
	}
	async build() {
		await this.isDashFree.fired
		this.isDashFree.resetSignal()

		await this.dash.build()

		this.isDashFree.dispatch()
	}
	async updateFiles(filePaths: string[]) {
		await this.isDashFree.fired
		this.isDashFree.resetSignal()

		await this.dash.updateFiles(filePaths)

		this.isDashFree.dispatch()
	}
	async unlink(path: string, updateDashFile = true) {
		await this.isDashFree.fired
		this.isDashFree.resetSignal()

		await this.dash.unlink(path, updateDashFile)

		this.isDashFree.dispatch()
	}
	async rename(oldPath: string, newPath: string) {
		await this.isDashFree.fired
		this.isDashFree.resetSignal()

		await this.dash.rename(oldPath, newPath)

		this.isDashFree.dispatch()
	}
	getCompilerOutputPath(filePath: string) {
		return this.dash.getCompilerOutputPath(filePath)
	}

	async setup() {
		await this.dataLoader.fired
		await this.dash.setup(this.dataLoader)
		this.isDashFree.dispatch()
	}
}

expose(DashService, self)
