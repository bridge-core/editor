import { TCompilerHook } from './Plugins'
import { TCompilerPlugin } from './TCompilerPlugin'
import { resolveFileOrder } from './Resolver'
import { dirname } from '/@/utils/path'
import { CompilerService } from './Service'
import isGlob from 'is-glob'
import { iterateDir } from '/@/utils/iterateDir'
import {
	AnyDirectoryHandle,
	AnyFileHandle,
	AnyHandle,
} from '/@/components/FileSystem/Types'
import { isMatch } from '/@/utils/glob/isMatch'

export interface IFileData {
	isLoaded?: boolean
	isDone?: boolean
	filePath: string
	fileHandle?: { getFile(): Promise<File> | File }
	saveFilePath?: string
	data?: any
	aliases: string[]
	updateFiles: Set<string>
	dependencies: Set<string>
	requiresGlobs: Set<string>
}
export interface ISaveFile {
	filePath: string
	updateFiles: string[]
	dependencies: string[]
	aliases: string[]
	requiresGlobs: string[]
}

export class Compiler {
	protected files!: Map<string, IFileData>

	constructor(protected parent: CompilerService) {}

	protected get fileSystem() {
		return this.parent.fileSystem
	}
	protected get outputFileSystem() {
		return this.parent.outputFileSystem
	}
	protected get plugins() {
		return this.parent.getPlugins()
	}
	getAliases(filePath: string) {
		return [...(this.files.get(filePath)?.aliases ?? [])]
	}

	async unlink(path: string, handle?: AnyHandle, requireHandle = true) {
		if (!handle && requireHandle) {
			try {
				handle = await this.fileSystem.getFileHandle(path)
			} catch {
				try {
					handle = await this.fileSystem.getDirectoryHandle(path)
				} catch {}
			}
		}

		if (!handle && requireHandle) return
		else if (!requireHandle || handle?.kind === 'file') {
			const saveFilePath: string | undefined =
				(await this.runAllHooks('transformPath', 0, path)) ?? undefined

			if (saveFilePath) this.outputFileSystem.unlink(saveFilePath)

			this.files.delete(path)
		} else if (handle?.kind === 'directory') {
			await iterateDir(
				<AnyDirectoryHandle>handle,
				(fileHandle, filePath) => this.unlink(filePath, fileHandle),
				undefined,
				path
			)
		}
	}
	async getCompilerOutputPath(path: string) {
		return (await this.runAllHooks('transformPath', 0, path)) ?? undefined
	}

	async runWithFiles(files: string[]) {
		this.parent.progress.setTotal(5)

		await this.loadSavedFiles()
		await this.runSimpleHook('buildStart')

		// Add files that we are supposed to include
		for (const includeFile of await this.runCollectHook('include')) {
			if (!this.files.has(includeFile)) files.push(includeFile)
		}

		this.parent.progress.addToCurrent(1)

		await this.compileFiles(files)

		await this.runSimpleHook('buildEnd')
		this.parent.progress.addToCurrent(1)
		await this.processFileMap()
	}
	async compileFiles(files: string[]) {
		const changedFiles = this.getChangedFiles(files)
		const flatFiles = this.flatFiles(files, new Set())
		this.parent.progress.setTotal(flatFiles.size * 2 + 5)

		this.addMatchingGlobImporters(flatFiles, changedFiles)

		// console.log([...flatFiles])
		await this.resolveFiles(flatFiles)
		await this.requireFiles(flatFiles)
		const sortedFiles = resolveFileOrder([...flatFiles], this.files)
		// console.log([...sortedFiles].map((file) => ({ ...file })))
		// console.log(sortedFiles)
		await this.finalizeFiles(sortedFiles)
	}
	async compileWithFile(filePath: string, file: File) {
		const fileHandle = { getFile: () => file }
		const fileData = this.files.get(filePath)

		if (fileData) {
			fileData.fileHandle = fileHandle
		} else {
			this.files.set(filePath, {
				isLoaded: false,
				filePath,
				fileHandle,
				aliases: [],
				updateFiles: new Set(),
				dependencies: new Set(),
				requiresGlobs: new Set(),
			})
		}

		await this.runSimpleHook('buildStart')

		const flatFiles = this.flatFiles(
			[filePath],
			new Set(),
			new Set(),
			false
		)

		await this.resolveFiles(flatFiles, false)
		await this.requireFiles(flatFiles)
		const sortedFiles = resolveFileOrder([...flatFiles], this.files)

		const compiledFile = await this.finalizeFiles(sortedFiles, false)
		this.resetFileData(sortedFiles)
		await this.runSimpleHook('buildEnd')

		flatFiles.delete(filePath)

		return <const>[[...flatFiles], compiledFile]
	}

	protected async loadSavedFiles() {
		// Load .compilerFiles JSON file
		try {
			this.files = new Map<string, IFileData>()
			const files = await this.fileSystem.readJSON(
				'.bridge/.compilerFiles'
			)
			for (const [fileId, fileData] of Object.entries<ISaveFile>(files)) {
				this.files.set(fileId, {
					filePath: fileData.filePath,
					aliases: fileData.aliases,
					updateFiles: new Set(fileData.updateFiles ?? []),
					dependencies: new Set(fileData.dependencies ?? []),
					requiresGlobs: new Set(fileData.requiresGlobs),
				})
			}
		} catch {}
		this.parent.progress.addToCurrent(1)
	}
	flatFiles(
		files: string[],
		fileSet: Set<string>,
		ignoreSet = new Set<string>(),
		addUpdateFiles = true,
		addDependencyFiles = true
	) {
		for (const filePath of files) {
			if (fileSet.has(filePath) || ignoreSet.has(filePath)) continue

			const file = this.files.get(filePath)
			if (file?.isLoaded) continue

			ignoreSet.add(filePath)

			// First: Add dependencies
			if (file && addDependencyFiles)
				this.flatFiles(
					[...file.dependencies],
					fileSet,
					ignoreSet,
					false,
					true
				)

			// Then: Add current file
			fileSet.add(filePath)
			if (!file) continue

			// Then: Update files which depend on the current file
			if (addUpdateFiles)
				this.flatFiles(
					[...file.updateFiles],
					fileSet,
					ignoreSet,
					addUpdateFiles,
					addDependencyFiles
				)

			ignoreSet.delete(filePath)

			this.parent.progress.addToCurrent(1)
		}

		return fileSet
	}
	getChangedFiles(
		files: string[],
		changedFiles = new Set<string>(),
		ignoreSet = new Set<string>()
	) {
		for (const filePath of files) {
			if (changedFiles.has(filePath)) continue

			const file = this.files.get(filePath)
			if (file?.isLoaded) continue

			ignoreSet.add(filePath)

			changedFiles.add(filePath)
			if (!file) continue

			this.flatFiles(
				[...file.updateFiles],
				changedFiles,
				ignoreSet,
				true,
				false
			)

			ignoreSet.delete(filePath)
		}

		return changedFiles
	}

	addMatchingGlobImporters(files: Set<string>, changedFiles: Set<string>) {
		const testFiles = [...changedFiles]

		for (const file of this.files.values()) {
			if (file.requiresGlobs.size === 0) continue

			// For every glob
			for (const glob of file.requiresGlobs.values()) {
				// If any filePath matches
				if (testFiles.some((filePath) => isMatch(filePath, glob)))
					// Also resolve the file with the glob imports later
					files.add(file.filePath)
			}
		}
	}

	protected async resolveFiles(files: Set<string>, writeFiles = true) {
		for (const filePath of files) {
			let file = this.files.get(filePath)
			if (file?.isLoaded) continue

			const saveFilePath: string | undefined =
				(await this.runAllHooks('transformPath', 0, filePath)) ??
				undefined

			let fileHandle: { getFile(): Promise<File> | File } | undefined =
				file?.fileHandle
			if (!fileHandle) {
				try {
					fileHandle = await this.fileSystem.getFileHandle(filePath)
				} catch {}
			}

			const readData = await this.runHook('read', filePath, fileHandle)
			if (readData === undefined || readData === null) {
				// Don't copy files if the saveFilePath is equals to the original filePath
				// ...or if the fileHandle doesn't exist (no file to copy)
				if (
					writeFiles &&
					!!fileHandle &&
					file?.fileHandle !== fileHandle &&
					!!saveFilePath &&
					saveFilePath !== filePath
				)
					await this.copyFile(<AnyFileHandle>fileHandle, saveFilePath)

				file = {
					isLoaded: true,
					filePath,
					aliases: [],
					updateFiles: new Set(),
					dependencies: new Set(),
					requiresGlobs: new Set(),
				}
				this.files.set(filePath, file)

				this.parent.progress.addToCurrent(2)
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
				requiresGlobs: new Set(),
			})

			this.parent.progress.addToCurrent(1)
		}
	}

	protected async requireFiles(files: Set<string>) {
		for (const filePath of files.values()) {
			const file = this.files.get(filePath)
			if (!file || !file.isLoaded) continue

			// Remove old dependencies
			const oldDeps = file.dependencies
			for (const dependency of oldDeps) {
				const depFile = this.files.get(dependency)
				if (depFile) depFile.updateFiles.delete(file.filePath)
			}
			file.dependencies = new Set()

			// Get new dependencies
			const dependencies = new Set<string>(
				await this.runCollectHook('require', file.filePath, file.data)
			)
			if (dependencies.size === 0) continue

			// Resolve glob imports
			const resolvedDeps = new Set<string>()
			for (const dependency of dependencies) {
				if (!isGlob(dependency)) {
					resolvedDeps.add(dependency)
					continue
				}

				// Add files which match glob as dependencies
				const matchingFiles = [
					...new Set([
						...this.parent.getOptions().allFiles,
						...files,
					]),
				].filter((filePath) => isMatch(filePath, dependency))
				matchingFiles.forEach((filePath) => resolvedDeps.add(filePath))

				// Add the glob import to file obj
				file.requiresGlobs.add(dependency)
			}

			for (const dependency of resolvedDeps) {
				let depFile =
					this.files.get(dependency) ??
					// Lookup dependency id in file aliases
					[...this.files.values()].find(({ aliases }) =>
						aliases.includes(dependency)
					)

				if (!depFile) {
					if (await this.fileSystem.fileExists(dependency)) {
						depFile = {
							isLoaded: false,
							filePath: dependency,
							aliases: [],
							updateFiles: new Set(),
							dependencies: new Set(),
							requiresGlobs: new Set(),
						}
					} else {
						console.error(
							`Undefined file dependency: "${filePath}" requires "${dependency}"`
						)
						continue
					}
				}

				// New dependency discovered
				if (!oldDeps.has(depFile.filePath)) {
					// If necessary, load it
					if (!depFile.isLoaded) {
						const newDep = new Set([depFile.filePath])
						await this.resolveFiles(newDep)
						await this.requireFiles(newDep)
					}

					// Add it to the files we need to load
					files.add(depFile.filePath)
				}

				depFile.updateFiles.add(file.filePath)
				file.dependencies.add(depFile.filePath)
			}
		}
	}

	protected async finalizeFiles(files: Set<IFileData>, writeFiles = true) {
		let writeData:
			| string
			| Uint8Array
			| ArrayBuffer
			| Blob
			| undefined = undefined

		for (const file of files) {
			// We don't need to transform files that won't be saved
			if (!file.saveFilePath || !file.isLoaded || file.isDone) continue

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
			writeData =
				(await this.runHook(
					'finalizeBuild',
					file.filePath,
					transformedData
				)) ?? transformedData

			if (writeFiles && writeData !== undefined && writeData !== null) {
				await this.outputFileSystem.mkdir(dirname(file.saveFilePath), {
					recursive: true,
				})
				await this.outputFileSystem.writeFile(
					file.saveFilePath,
					writeData
				)
			}
			file.isDone = true
			this.parent.progress.addToCurrent(1)
		}

		return writeData
	}

	async processFileMap() {
		// Clean up file map
		const filesObject: Record<string, ISaveFile> = {}

		for (const [id, file] of this.files) {
			file.saveFilePath = undefined
			file.data = undefined
			file.fileHandle = undefined
			file.isLoaded = false
			file.isDone = false

			if (
				file.updateFiles.size > 0 ||
				file.dependencies.size > 0 ||
				file.aliases.length > 0 ||
				file.requiresGlobs.size > 0
			)
				filesObject[id] = {
					filePath: file.filePath,
					aliases: file.aliases,
					updateFiles: [...file.updateFiles.values()],
					dependencies: [...file.dependencies.values()],
					requiresGlobs: [...file.requiresGlobs.values()],
				}
		}

		// Save files map
		await this.fileSystem.writeJSON(
			'.bridge/.compilerFiles',
			filesObject,
			true
		)
		this.parent.progress.addToCurrent(1)
	}

	protected resetFileData(files: Set<IFileData>) {
		for (const file of files) {
			file.data = undefined
			file.saveFilePath = undefined
			file.isLoaded = false
			file.isDone = false
			file.fileHandle = undefined
		}
	}

	protected async copyFile(
		originalFile: AnyFileHandle,
		saveFilePath: string
	) {
		const copiedFileHandle = await this.outputFileSystem.getFileHandle(
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
				console.error(
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
