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
import { PackTypeLibrary } from '../../Data/PackType'
import { DashFileSystem } from './FileSystem'

export interface ICompilerOptions {
	config: string
	mode: 'development' | 'production'
	pluginFileTypes: IFileType[]
}

export class DashService {
	protected dataLoader = new DataLoader()
	public fileType: FileTypeLibrary
	protected _dash: Dash<DataLoader>

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
		this._dash = new Dash<DataLoader>(fileSystem, outputFileSystem, {
			config: options.config,
			mode: 'development',
			fileType: this.fileType,
			packType: new PackTypeLibrary(),
			requestJsonData: (path) => this.dataLoader.readJSON(path),
		})
	}

	async setup() {
		await this.dataLoader.fired
		await this.dash.setup(this.dataLoader)
	}
	get dash() {
		return this._dash
	}
}

expose(DashService, self)
