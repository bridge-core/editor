import { TCompilerHook, TCompilerPlugin } from './Plugins'
import { resolveFileOrder } from './Resolver'
import { dirname } from '/@/utils/path'
import { CompilerService } from './Service'

export interface IFileData {
	isLoaded?: boolean
	isDone?: boolean
	filePath: string
	saveFilePath?: string
	data?: any
	aliases: string[]
	updateFiles: Set<string>
	dependencies: Set<string>
}
export interface ISaveFile {
	filePath: string
	updateFiles: string[]
	dependencies: string[]
	aliases: string[]
}

export class Compiler {
	protected files = new Map<string, IFileData>()

	constructor(protected parent: CompilerService) {}

	protected get fileSystem() {
		return this.parent.fileSystem
	}
	protected get plugins() {
		return this.parent.getPlugins()
	}

	async runWithFiles(files: string[]) {
		this.parent.progress.setTotal(files.length * 2)

		await this.loadSavedFiles()
		await this.runSimpleHook('buildStart')

		await this.compileFiles(files)

		await this.runSimpleHook('buildEnd')
		await this.processFileMap()
	}
	async compileFiles(files: string[], errorOnReadFailure = true) {
		await this.resolveFiles(
			this.flatFiles(files, new Set()),
			errorOnReadFailure
		)
		await this.requireFiles(files)
		const sortedFiles = resolveFileOrder(this.files)
		await this.finalizeFiles(sortedFiles)
	}

	protected async loadSavedFiles() {
		// Load files.json file
		try {
			this.files.clear()
			const files = await this.fileSystem.readJSON('bridge/files.json')
			for (const [fileId, fileData] of Object.entries<ISaveFile>(files)) {
				this.files.set(fileId, {
					filePath: fileData.filePath,
					aliases: fileData.aliases,
					updateFiles: new Set(fileData.updateFiles ?? []),
					dependencies: new Set(fileData.dependencies ?? []),
				})
			}
		} catch {}
	}
	flatFiles(files: string[], fileSet: Set<string>) {
		for (const filePath of files) {
			if (fileSet.has(filePath)) continue

			const file = this.files.get(filePath)
			if (file?.isLoaded) continue

			fileSet.add(filePath)
			if (!file) continue

			this.flatFiles(
				[...file.dependencies, ...file.updateFiles],
				fileSet
			).forEach((f) => fileSet.add(f))

			this.parent.progress.addToCurrent(1)
		}

		return [...fileSet]
	}

	protected async resolveFiles(files: string[], errorOnReadFailure = true) {
		for (const filePath of files) {
			let file = this.files.get(filePath)
			if (file?.isLoaded) continue

			const saveFilePath: string = await this.runAllHooks(
				'transformPath',
				0,
				filePath
			)

			let fileHandle: FileSystemFileHandle | undefined = undefined
			try {
				fileHandle = await this.fileSystem.getFileHandle(filePath)
			} catch {
				if (errorOnReadFailure)
					throw new Error(
						`Cannot access file "${filePath}": File does not exist`
					)
			}

			const readData = await this.runHook('read', filePath, fileHandle)
			if (readData === undefined || readData === null) {
				// Don't copy files if the saveFilePath is equals to the original filePath
				// ...or if the fileHandle doesn't exist (no file to copy)
				if (!!fileHandle && saveFilePath !== filePath)
					await this.copyFile(fileHandle, saveFilePath)
				continue
			}

			const data =
				(await this.runAllHooks('load', 1, filePath, readData)) ??
				readData

			const aliases = await this.runHook(
				'registerAliases',
				filePath,
				data
			)

			this.files.set(filePath, {
				isLoaded: true,
				filePath,
				saveFilePath,
				data,
				aliases: aliases ?? [],
				updateFiles: file?.updateFiles ?? new Set(),
				dependencies: file?.dependencies ?? new Set(),
			})

			this.parent.progress.addToCurrent(1)
		}
	}

	protected async requireFiles(files: string[]) {
		for (const filePath of files) {
			const file = this.files.get(filePath)
			if (!file || !file.isLoaded) continue

			// Remove old updateFile refs
			const oldDeps = file.dependencies
			for (const dependency of file.dependencies) {
				const depFile = this.files.get(dependency)
				if (depFile) depFile.updateFiles.delete(file.filePath)
			}
			file.dependencies = new Set()

			// Get new dependencies
			const dependencies = new Set(
				await this.runCollectHook('require', file.filePath, file.data)
			)

			for (const dependency of dependencies) {
				const depFile =
					this.files.get(dependency) ??
					// Lookup dependency id in file aliases
					[...this.files.values()].find(({ aliases }) =>
						aliases.includes(dependency)
					)

				if (!depFile)
					throw new Error(
						`Undefined file dependency: "${file.filePath}" requires "${dependency}"`
					)

				// New dependency discovered, compile it
				if (!oldDeps.has(depFile.filePath) && !depFile.isLoaded)
					await this.compileFiles([depFile.filePath])

				depFile.updateFiles.add(file.filePath)
				file.dependencies.add(depFile.filePath)
			}
		}
	}

	protected async finalizeFiles(files: Set<IFileData>) {
		for (const file of files) {
			// We don't need to transform files that won't be saved
			if (!file.saveFilePath || file.isDone) continue

			const transformedData =
				(await this.runAllHooks(
					'transform',
					1,
					file.filePath,
					file.data,
					Object.fromEntries(
						[...file.dependencies]
							.map((dep) => {
								const depFile = this.files.get(dep)
								return [
									dep,
									...(depFile?.aliases ?? []),
								].map((id) => [id, depFile?.data])
							})
							.flat()
					)
				)) ?? file.data
			const writeData =
				(await this.runHook(
					'finalizeBuild',
					file.filePath,
					transformedData
				)) ?? transformedData

			await this.fileSystem.mkdir(dirname(file.saveFilePath), {
				recursive: true,
			})
			await this.fileSystem.writeFile(file.saveFilePath, writeData)

			file.isDone = true
			this.parent.progress.addToCurrent(1)
		}
	}

	protected async processFileMap() {
		// Clean up file map
		const filesObject: Record<string, ISaveFile> = {}

		for (const [id, file] of this.files) {
			file.saveFilePath = undefined
			file.data = undefined
			if (
				file.updateFiles.size > 0 ||
				file.dependencies.size > 0 ||
				file.aliases.length > 0
			)
				filesObject[id] = {
					filePath: file.filePath,
					aliases: file.aliases,
					updateFiles: [...file.updateFiles.values()],
					dependencies: [...file.dependencies.values()],
				}
		}

		// Save files map
		await this.fileSystem.writeJSON('bridge/files.json', filesObject, true)
	}

	protected async copyFile(
		originalFile: FileSystemFileHandle,
		saveFilePath: string
	) {
		const copiedFileHandle = await this.fileSystem.getFileHandle(
			saveFilePath,
			true
		)

		const writable = await copiedFileHandle.createWritable()
		await writable.write(await originalFile.getFile())
		await writable.close()
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
			if (hookRes === undefined) continue

			args[writeReturnToIndex] = hookRes
		}

		return args[writeReturnToIndex]
	}
	protected async runCollectHook<T extends TCompilerHook>(
		hookName: T,
		...args: Parameters<TCompilerPlugin[T]>
	) {
		const res: any[] = []
		for (const [_, plugin] of this.plugins) {
			const hook = plugin[hookName]
			if (typeof hook !== 'function') continue

			// @ts-expect-error TypeScript is not smart enough
			const hookRes = await hook(...args)
			if (hookRes === null || hookRes === undefined) continue

			if (Array.isArray(hookRes)) res.push(...hookRes)
			else res.push(hookRes)
		}

		return res
	}
}
