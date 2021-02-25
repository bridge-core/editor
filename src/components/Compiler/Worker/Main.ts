import * as Comlink from 'comlink'
import { TaskService } from '/@/components/TaskManager/WorkerTask'
import { loadPlugins, TCompilerHook, TCompilerPlugin } from './Plugins'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { FileType, IFileType } from '/@/components/Data/FileType'
import { dirname } from '/@/utils/path'

export interface ICompilerOptions {
	projectDirectory: FileSystemDirectoryHandle
	baseDirectory: FileSystemDirectoryHandle
	config: string
	mode: 'dev' | 'build'
	plugins: Record<string, string>
	pluginFileTypes: IFileType[]
}
export interface IBuildConfig {
	mode: 'dev' | 'build'

	createFiles: string[]
	plugins: TPluginDef[]
}
export type TPluginDef = string | [string, any]

export interface IFileData {
	filePath?: string
	saveFilePath?: string
	transformedData?: any
	updateFiles: Set<string>
}
export class CompilerService extends TaskService<void, string[]> {
	protected buildConfig!: IBuildConfig
	protected plugins!: Map<string, Partial<TCompilerPlugin>>
	protected files = new Map<string, IFileData>()

	constructor(protected readonly options: ICompilerOptions) {
		super('compiler', options.projectDirectory)
		FileType.setPluginFileTypes(options.pluginFileTypes)
	}

	getOptions() {
		return this.options
	}
	get pluginOpts() {
		return Object.fromEntries(
			this.buildConfig.plugins.map((def) =>
				Array.isArray(def)
					? [def[0], { ...def[1], mode: this.options.mode }]
					: [def, { mode: this.options.mode }]
			)
		)
	}

	async onStart(updatedFiles: string[]) {
		// Load files.json file
		try {
			const data = await this.fileSystem.readJSON('bridge/files.json')
			for (const id in data) {
				if (Array.isArray(data[id]))
					this.files.set(id, { updateFiles: new Set(data[id]) })
			}
		} catch {}

		const globalFs = new FileSystem(this.options.baseDirectory)
		await FileType.setup(globalFs)

		try {
			this.buildConfig = await this.fileSystem.readJSON(
				`bridge/compiler/${this.options.config}`
			)
		} catch {
			return
		}

		await this.loadPlugins(this.options.plugins)

		this.progress.setTotal(updatedFiles.length)

		await this.runSimpleHook('buildStart')

		for (const updatedFile of updatedFiles) {
			await this.compileFile(updatedFile)
			this.progress.addToCurrent(1)
		}

		await this.runSimpleHook('buildEnd')

		await this.processFileMap()
	}

	async updateFile(filePath: string) {
		const file = this.files.get(filePath)
		await this.runSimpleHook('buildStart')

		if (file) {
			for (const updateFile of file.updateFiles) {
				await this.compileFile(updateFile)
			}
		}

		await this.compileFile(filePath)
		await this.runSimpleHook('buildEnd')
		await this.processFileMap()
	}

	async processFileMap() {
		// Clean up file map
		const filesObject: Record<string, string[]> = {}

		for (const [id, file] of this.files) {
			file.filePath = undefined
			file.saveFilePath = undefined
			file.transformedData = undefined
			if (file.updateFiles.size > 0)
				filesObject[id] = [...file.updateFiles.values()]
		}

		// Save files map
		await this.fileSystem.writeJSON('bridge/files.json', filesObject)
	}

	async compileFile(id: string, importer?: string, createId?: boolean) {
		const resolvedData = await this.resolve(id, importer, createId)
		if (resolvedData) await this.finalizeFile(...resolvedData)
		return resolvedData
	}
	async resolve(id: string, importer?: string, createId = false) {
		const filePath = (await this.runHook('resolveId', id)) ?? id
		await this.runSimpleHook('afterResolveId', filePath)
		let file = this.files.get(id) ?? this.files.get(filePath)

		// File found: Add importer & skip other steps if possible
		if (file) {
			if (importer) file.updateFiles.add(importer)

			if (file.filePath && file.saveFilePath && file.transformedData)
				return <const>[
					file.filePath,
					file.saveFilePath,
					file.transformedData,
				]
		} else {
			file = {
				filePath,
				updateFiles: new Set(importer ? [importer] : undefined),
			}
		}

		let originalFile: FileSystemFileHandle
		try {
			originalFile = await this.fileSystem.getFileHandle(
				filePath,
				createId
			)
		} catch {
			throw new Error(
				`Cannot access file "${filePath}": File does not exist`
			)
		}

		const saveFilePath =
			(await this.runAllHooks('transformPath', 0, filePath)) ?? filePath
		const data = await this.runHook('load', filePath, originalFile)

		// Nothing to load, just copy file over
		if (!createId && (data === undefined || data === null)) {
			if (saveFilePath === filePath) return

			const copiedFileHandle = await this.fileSystem.getFileHandle(
				saveFilePath,
				true
			)

			const writable = await copiedFileHandle.createWritable()
			await writable.write(await originalFile.getFile())
			await writable.close()
			return
		}

		if (createId) await this.fileSystem.unlink(filePath)

		const transformedData = await this.runAllHooks(
			'transform',
			1,
			filePath,
			data
		)

		file.transformedData = transformedData
		file.saveFilePath = saveFilePath
		this.files.set(id, file)
		this.files.set(filePath, file)

		return <const>[filePath, saveFilePath, transformedData]
	}

	async finalizeFile(
		filePath: string,
		saveFilePath: string,
		transformedData: string
	) {
		const writeData = await this.runHook(
			'finalizeBuild',
			filePath,
			transformedData
		)

		if (
			saveFilePath === filePath ||
			writeData === undefined ||
			writeData === null
		)
			return

		await this.fileSystem.mkdir(dirname(saveFilePath), { recursive: true })
		await this.fileSystem.writeFile(saveFilePath, writeData)
	}

	protected async runHook<T extends TCompilerHook>(
		hookName: T,
		...args: Parameters<TCompilerPlugin[T]>
	): Promise<ReturnType<TCompilerPlugin[T]> | undefined> {
		for (const [_, plugin] of this.plugins) {
			const hook = plugin[hookName]
			if (typeof hook !== 'function') continue
			// @ts-expect-error TypeScript is not smart enough
			const hookRes = await hook(...args)
			if (hookRes !== null && hookRes !== undefined) return hookRes
		}
	}
	protected async runSimpleHook<T extends TCompilerHook>(
		hookName: T,
		...args: Parameters<TCompilerPlugin[T]>
	) {
		for (const [pluginName, plugin] of this.plugins) {
			const hook = plugin[hookName]
			if (typeof hook !== 'function') continue

			try {
				// @ts-expect-error TypeScript is not smart enough
				await hook(...args)
			} catch (err) {
				throw new Error(
					`Compiler plugin "${pluginName}#${hookName}" threw error "${err}"`
				)
			}
		}
	}
	protected async runAllHooks<T extends TCompilerHook>(
		hookName: T,
		writeReturnToIndex: number,
		...args: Parameters<TCompilerPlugin[T]>
	) {
		for (const [_, plugin] of this.plugins) {
			const hook = plugin[hookName]
			if (typeof hook !== 'function') continue

			// @ts-expect-error TypeScript is not smart enough
			const hookRes = await hook(...args)
			if (hookRes === null || hookRes === undefined) continue

			args[writeReturnToIndex] = hookRes
		}

		return args[writeReturnToIndex]
	}

	async loadPlugins(plugins: Record<string, string>) {
		const globalFs = new FileSystem(this.options.baseDirectory)

		this.plugins = await loadPlugins({
			fileSystem: globalFs,
			pluginPaths: plugins,
			localFs: this.fileSystem,
			pluginOpts: this.pluginOpts,
			getFiles: () => this.files,
			resolve: (id: string, importer?: string, createId = false) =>
				this.compileFile(id, importer, createId).then(
					(resolveData) => resolveData
				),
		})
	}
	async updatePlugins(
		plugins: Record<string, string>,
		pluginFileTypes: IFileType[]
	) {
		await this.loadPlugins(plugins)
		FileType.setPluginFileTypes(pluginFileTypes)
	}
	updateMode(mode: 'dev' | 'build') {
		this.options.mode = mode
	}
}

Comlink.expose(CompilerService, self)
