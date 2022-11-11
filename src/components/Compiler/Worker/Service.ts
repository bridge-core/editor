// @ts-ignore Make "path" work on this worker
globalThis.process = {
	cwd: () => '',
	env: {},
	release: {
		name: 'browser',
	},
}

import '/@/components/FileSystem/Virtual/Comlink'
import { expose } from 'comlink'
import { FileTypeLibrary, IFileType } from '/@/components/Data/FileType'
import { DataLoader } from '/@/components/Data/DataLoader'
import type { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { Dash, initRuntimes } from 'dash-compiler'
import { PackTypeLibrary } from '/@/components/Data/PackType'
import { DashFileSystem } from './FileSystem'
import { Signal } from '/@/components/Common/Event/Signal'
import { dirname } from '/@/utils/path'
import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'
import { ForeignConsole } from './Console'
import { Mutex } from '../../Common/Mutex'
import wasmUrl from '@swc/wasm-web/wasm-web_bg.wasm?url'

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
	protected fileSystem: DashFileSystem
	public fileType: FileTypeLibrary
	protected readonly dash: Dash<DataLoader>
	public isDashFree = new Mutex()
	protected projectDir: string
	public isSetup = false
	public completedStartUp = new Signal<void>()
	protected console: ForeignConsole

	constructor(
		baseDirectory: AnyDirectoryHandle,
		comMojangDirectory: AnyDirectoryHandle | undefined,
		options: ICompilerOptions
	) {
		super()
		this.fileSystem = new DashFileSystem(baseDirectory)
		const outputFileSystem =
			comMojangDirectory && options.mode === 'development'
				? new DashFileSystem(comMojangDirectory)
				: undefined
		this.fileType = new FileTypeLibrary()
		this.fileType.setPluginFileTypes(options.pluginFileTypes)

		let console = consoles.get(options.projectName)
		if (!console) {
			console = new ForeignConsole()
			consoles.set(options.projectName, console)
		}
		this.console = console

		this.dash = new Dash<DataLoader>(this.fileSystem, outputFileSystem, {
			config: options.config,
			compilerConfig: options.compilerConfig,
			console,
			mode: options.mode,
			fileType: this.fileType,
			packType: new PackTypeLibrary(),
			verbose: true,
			requestJsonData: (path) => dataLoader.readJSON(path),
		})

		this.projectDir = dirname(options.config)
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

		const fs = this.fileSystem.internal
		if (
			(await fs.fileExists(
				`${this.projectDir}/.bridge/.restartWatchMode`
			)) ||
			!(await fs.fileExists(
				// TODO(Dash): Replace with call to "this.dash.dashFilePath" once the accessor is no longer protected
				`${this.projectDir}/.bridge/.dash.${this.dash.getMode()}.json`
			))
		) {
			await Promise.all([
				this.build(false).catch((err) => console.error(err)),
				fs
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

		await this.dash.build()

		if (acquireLock) this.isDashFree.unlock()
	}
	async updateFiles(filePaths: string[], acquireLock = true) {
		if (acquireLock) await this.isDashFree.lock()
		this.dispatch()

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

	async setup() {
		await this.isDashFree.lock()

		if (!dataLoader.hasFired) await dataLoader.loadData()
		await this.dash.setup(dataLoader)

		this.isDashFree.unlock()
		this.isSetup = true
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
