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
import { dirname } from '/@/utils/path'
import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'
import { ForeignConsole } from './Console'

export interface ICompilerOptions {
	config: string
	compilerConfig?: string
	mode: 'development' | 'production'
	projectName: string
	pluginFileTypes: IFileType[]
}
const dataLoader = new DataLoader()
const consoles = new Map<string, ForeignConsole>()

export class DashService extends EventDispatcher<void> {
	protected fileSystem: DashFileSystem
	public fileType: FileTypeLibrary
	protected dash: Dash<DataLoader>
	public isDashFree = new Signal<void>()
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
		await this.isDashFree.fired
		this.isDashFree.resetSignal()

		const [deps, data] = await this.dash.compileFile(filePath, fileContent)
		this.isDashFree.dispatch()
		return <const>[deps, data ?? fileContent]
	}

	async start(changedFiles: string[], deletedFiles: string[]) {
		const fs = this.fileSystem.internal
		if (
			(await fs.fileExists(
				`${this.projectDir}/.bridge/.restartDevServer`
			)) ||
			!(await fs.fileExists(
				// TODO(Dash): Replace with call to "this.dash.dashFilePath" once the accessor is no longer protected
				`${this.projectDir}/.bridge/.dash.${this.dash.getMode()}.json`
			))
		) {
			await Promise.all([
				this.build().catch((err) => console.error(err)),
				fs
					.unlink(`${this.projectDir}/.bridge/.restartDevServer`)
					.catch((err) => console.error(err)),
			])
		} else {
			await Promise.all([
				...deletedFiles.map((f) => this.unlink(f, false)),
			])

			if (changedFiles.length > 0) await this.updateFiles(changedFiles)
		}

		this.completedStartUp.dispatch()
	}

	async build() {
		await this.isDashFree.fired
		this.isDashFree.resetSignal()
		this.dispatch()

		await this.dash.build()

		this.isDashFree.dispatch()
	}
	async updateFiles(filePaths: string[]) {
		await this.isDashFree.fired
		this.isDashFree.resetSignal()
		this.dispatch()

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
		this.dispatch()

		await this.dash.rename(oldPath, newPath)

		this.isDashFree.dispatch()
	}
	getCompilerOutputPath(filePath: string) {
		return this.dash.getCompilerOutputPath(filePath)
	}

	async setup() {
		await dataLoader.fired
		await this.dash.setup(dataLoader)

		this.isDashFree.dispatch()
		this.isSetup = true
	}
	async reloadPlugins() {
		await this.isDashFree.fired
		this.isDashFree.resetSignal()

		await this.dash.reload()

		this.isDashFree.dispatch()
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
