import '/@/utils/worker/inject'

import '/@/components/FileSystem/Virtual/Comlink'
import { expose } from 'comlink'
import { FileTypeLibrary, IFileType } from '/@/components/Data/FileType'
import { DataLoader } from '/@/components/Data/DataLoader'
import type { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { Dash, initRuntimes, FileSystem } from '@bridge-editor/dash-compiler'
import { PackTypeLibrary } from '/@/components/Data/PackType'
import { DashFileSystem } from './FileSystem'
import { Signal } from '/@/components/Common/Event/Signal'
import { dirname } from '/@/utils/path'
import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'
import { ForeignConsole } from './Console'
import { Mutex } from '../../Common/Mutex'
import wasmUrl from '@swc/wasm-web/wasm-web_bg.wasm?url'
import { VirtualDirectoryHandle } from '../../FileSystem/Virtual/DirectoryHandle'
import { TauriFsStore } from '../../FileSystem/Virtual/Stores/TauriFs'

initRuntimes(wasmUrl)

export interface ICompilerOptions {
	config: string
	compilerConfig?: string
	mode: 'development' | 'production'
	projectName: string
	pluginFileTypes: IFileType[]
}
const dataLoader = new DataLoader()
const consoles = new Map<string, ForeignConsole>()

/**
 * Dispatches an event whenever a task starts with progress steps
 */
export class DashService extends EventDispatcher<void> {
	protected _fileSystem?: FileSystem
	public _fileType?: FileTypeLibrary
	protected _dash?: Dash<DataLoader>
	public isDashFree = new Mutex()
	protected _projectDir?: string
	public isSetup = false
	public completedStartUp = new Signal<void>()
	protected _console?: ForeignConsole

	constructor() {
		super()
	}

	async setup(
		baseDirectory: AnyDirectoryHandle,
		comMojangDirectory: AnyDirectoryHandle | undefined,
		options: ICompilerOptions
	) {
		await this.isDashFree.lock()

		if (!dataLoader.hasFired) await dataLoader.loadData()

		this._fileSystem = await this.createFileSystem(baseDirectory)
		const outputFileSystem =
			comMojangDirectory && options.mode === 'development'
				? await this.createFileSystem(comMojangDirectory)
				: undefined
		this._fileType = new FileTypeLibrary()
		this._fileType.setPluginFileTypes(options.pluginFileTypes)

		let console = consoles.get(options.projectName)
		if (!console) {
			console = new ForeignConsole()
			consoles.set(options.projectName, console)
		}
		this._console = console

		this._projectDir = dirname(options.config)

		this._dash = new Dash<DataLoader>(this._fileSystem, outputFileSystem, {
			config: options.config,
			compilerConfig: options.compilerConfig,
			console,
			mode: options.mode,
			fileType: <any>this._fileType,
			packType: <any>new PackTypeLibrary(),
			verbose: true,
			requestJsonData: (path) => dataLoader.readJSON(path),
		})
		await this.dash.setup(dataLoader)

		this.isDashFree.unlock()
		this.isSetup = true
	}
	protected async createFileSystem(directoryHandle: AnyDirectoryHandle) {
		// Default file system on PWA builds
		if (!import.meta.env.VITE_IS_TAURI_APP)
			return new DashFileSystem(directoryHandle)

		if (!(directoryHandle instanceof VirtualDirectoryHandle))
			throw new Error(
				`Expected directoryHandle to be a virtual directory handle`
			)
		const baseStore = directoryHandle.getBaseStore()
		if (!(baseStore instanceof TauriFsStore))
			throw new Error(
				`Expected virtual directory to be backed by TauriFsStore`
			)

		const { TauriBasedDashFileSystem } = await import('./TauriFs')
		return new TauriBasedDashFileSystem(baseStore.getBaseDirectory())
	}

	get dash() {
		if (!this._dash) throw new Error('Dash not initialized')
		return this._dash
	}
	get fileSystem() {
		if (!this._fileSystem) throw new Error('File system not initialized')
		return this._fileSystem
	}
	get console() {
		if (!this._console) throw new Error('Console not initialized')
		return this._console
	}
	get projectDir() {
		if (!this._projectDir)
			throw new Error('Project directory not initialized')
		return this._projectDir
	}

	getCompilerLogs() {
		return this.console.getLogs()
	}
	clearCompilerLogs() {
		this.console.clear()
	}
	onConsoleUpdate(cb: () => void) {
		this.console.addChangeListener(cb)
	}
	removeConsoleListeners() {
		this.console.removeChangeListeners()
	}

	async compileFile(filePath: string, fileContent: Uint8Array) {
		await this.isDashFree.lock()

		const [deps, data] = await this.dash.compileFile(filePath, fileContent)
		this.isDashFree.unlock()
		return <const>[deps, data ?? fileContent]
	}

	async start(changedFiles: string[], deletedFiles: string[]) {
		await this.isDashFree.lock()

		const fileExists = (path: string) =>
			this.fileSystem
				.readFile(path)
				.then(() => true)
				.catch(() => false)

		if (
			(await fileExists(
				`${this.projectDir}/.bridge/.restartWatchMode`
			)) ||
			!(await fileExists(
				// TODO(Dash): Replace with call to "this.dash.dashFilePath" once the accessor is no longer protected
				`${this.projectDir}/.bridge/.dash.${this.dash.getMode()}.json`
			))
		) {
			await Promise.all([
				this.build(false).catch((err) => console.error(err)),
				this.fileSystem
					.unlink(`${this.projectDir}/.bridge/.restartWatchMode`)
					.catch((err) => console.error(err)),
			])
		} else {
			if (deletedFiles.length > 0)
				await this.unlinkMultiple(deletedFiles, false)

			if (changedFiles.length > 0)
				await this.updateFiles(changedFiles, false)
		}

		this.completedStartUp.dispatch()
		this.isDashFree.unlock()
	}

	async build(acquireLock = true) {
		if (acquireLock) await this.isDashFree.lock()
		this.dispatch()

		// Reload plugins so we can be sure that e.g. custom commands/components get discovered correctly
		await this.dash.reload()
		await this.dash.build()

		if (acquireLock) this.isDashFree.unlock()
	}
	async updateFiles(filePaths: string[], acquireLock = true) {
		if (acquireLock) await this.isDashFree.lock()
		this.dispatch()

		// Reload plugins so we can be sure that e.g. custom commands/components get discovered correctly
		await this.dash.reload()
		await this.dash.updateFiles(filePaths)

		if (acquireLock) this.isDashFree.unlock()
	}
	async unlink(path: string, updateDashFile = true) {
		await this.isDashFree.lock()

		await this.dash.unlink(path, updateDashFile)

		this.isDashFree.unlock()
	}
	async unlinkMultiple(paths: string[], acquireLock = true) {
		if (acquireLock) await this.isDashFree.lock()

		await this.dash.unlinkMultiple(paths)

		if (acquireLock) this.isDashFree.unlock()
	}
	async rename(oldPath: string, newPath: string) {
		await this.isDashFree.lock()
		this.dispatch()

		await this.dash.rename(oldPath, newPath)

		this.isDashFree.unlock()
	}
	async renameMultiple(renamePaths: [string, string][]) {
		for (const [oldPath, newPath] of renamePaths) {
			await this.dash.rename(oldPath, newPath)
		}
	}
	getCompilerOutputPath(filePath: string) {
		return this.dash.getCompilerOutputPath(filePath)
	}
	getFileDependencies(filePath: string) {
		return this.dash.getFileDependencies(filePath)
	}

	async reloadPlugins() {
		await this.isDashFree.lock()

		await this.dash.reload()

		this.isDashFree.unlock()
	}

	onProgress(cb: (progress: number) => void) {
		const disposable = this.dash.progress.onChange((progress) => {
			if (progress.percentage === 1) {
				disposable.dispose()
				cb(1)
			} else {
				cb(progress.percentage)
			}
		})
	}
}

expose(DashService, self)
