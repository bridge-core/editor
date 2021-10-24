import type { ILightningInstruction } from '/@/components/PackIndexer/Worker/Main'
import type { IPackSpiderFile } from '/@/components/PackIndexer/Worker/PackSpider/PackSpider'
import { Signal } from '/@/components/Common/Event/Signal'
import type { CompareOperator } from 'compare-versions'
import { DataLoader } from './DataLoader'
import { isMatch } from '/@/utils/glob/isMatch'
import { AnyFileHandle } from '../FileSystem/Types'
import json5 from 'json5'
import { hasAnyPath } from '/@/utils/walkObject'
import { extname } from '/@/utils/path'
import { TPackTypeId } from './PackType'
import type { ProjectConfig } from '/@/components/Projects/Project/Config'

/**
 * Describes the structure of a file definition
 */
export interface IFileType {
	type?: 'json' | 'text' | 'nbt'
	id: string
	icon?: string
	detect?: {
		packType?: TPackTypeId | TPackTypeId[]
		scope?: string | string[]
		matcher?: string | string[]
		fileContent?: string[]
		fileExtensions?: string[]
	}

	schema: string
	types: (string | [string, { targetVersion: [CompareOperator, string] }])[]
	packSpider: string
	lightningCache: string
	definitions: IDefinitions
	formatOnSaveCapable: boolean
	documentation?: {
		baseUrl: string
		supportsQuerying?: boolean // Default: true
	}
	meta?: {
		commandsUseSlash?: boolean
		language?: string
	}
	highlighterConfiguration?: {
		keywords?: string[]
		typeIdentifiers?: string[]
		variables?: string[]
		definitions?: string[]
	}
}
export interface IDefinitions {
	[key: string]: IDefinition | IDefinition[]
}
export interface IDefinition {
	directReference?: boolean
	from: string
	match: string
}

/**
 * Used for return type of FileType.getMonacoSchemaArray() function
 */
export interface IMonacoSchemaArrayEntry {
	fileMatch?: string[]
	uri: string
	schema?: any
}

/**
 * Utilities around bridge.'s file definitions
 */
export class FileTypeLibrary {
	public ready = new Signal<void>()
	protected pluginFileTypes = new Set<IFileType>()
	protected fileTypes: IFileType[] = []

	constructor(protected projectConfig?: ProjectConfig) {}

	setProjectConfig(projectConfig: ProjectConfig) {
		this.projectConfig = projectConfig
	}

	async setup(dataLoader: DataLoader) {
		if (this.fileTypes.length > 0) return
		await dataLoader.fired

		const basePath = 'data/packages/minecraftBedrock/fileDefinition'
		const dirents = await dataLoader.getDirectoryHandle(basePath)

		for await (const dirent of dirents.values()) {
			if (dirent.kind !== 'file') return

			let json = await dataLoader
				.readJSON(`${basePath}/${dirent.name}`)
				.catch(() => null)
			if (json) this.fileTypes.push(json)
		}

		await this.loadLightningCache(dataLoader)
		await this.loadPackSpider(dataLoader)

		this.ready.dispatch()
	}
	addPluginFileType(fileDef: IFileType) {
		this.pluginFileTypes.add(fileDef)

		return {
			dispose: () => this.pluginFileTypes.delete(fileDef),
		}
	}
	getPluginFileTypes() {
		return [...this.pluginFileTypes.values()]
	}
	setPluginFileTypes(fileDefs: IFileType[] = []) {
		this.pluginFileTypes.clear()
		fileDefs.forEach((fileDef) => this.pluginFileTypes.add(fileDef))
	}

	/**
	 * Get the file definition data for the given file path
	 * @param filePath file path to fetch file definition for
	 */
	get(filePath?: string, searchFileType?: string) {
		const extension = filePath ? extname(filePath) : null

		for (const fileType of this.fileTypes) {
			if (searchFileType !== undefined && searchFileType === fileType.id)
				return fileType
			else if (!filePath) continue

			const fileExtensions = fileType.detect?.fileExtensions
			const scope = fileType.detect?.scope
			const matcher = fileType.detect?.matcher

			if (
				fileExtensions &&
				extension &&
				!fileExtensions.includes(extension)
			)
				continue

			if (scope) {
				if (typeof scope === 'string') {
					if (filePath.startsWith(scope)) return fileType
				} else if (Array.isArray(scope)) {
					if (scope.some((scope) => filePath.startsWith(scope)))
						return fileType
				}
			} else if (matcher) {
				if (isMatch(filePath, matcher)) {
					return fileType
				}
			} else {
				console.log(fileType)
				throw new Error(
					`Invalid file definition, no "detect" properties`
				)
			}
		}
	}

	getGlobal(filePath?: string, searchFileType?: string) {
		const extension = filePath ? extname(filePath) : null

		for (const fileType of this.fileTypes) {
			if (searchFileType !== undefined && searchFileType === fileType.id)
				return fileType
			else if (!filePath) continue

			const packTypes =
				fileType.detect?.packType === undefined
					? []
					: Array.isArray(fileType.detect?.packType)
					? fileType.detect?.packType
					: [fileType.detect?.packType]

			const fileExtensions = fileType.detect?.fileExtensions
			const hasScope = !!fileType.detect?.scope
			const scope = Array.isArray(fileType.detect?.scope)
				? fileType.detect?.scope
				: [fileType.detect?.scope!]
			const hasMatcher = !!fileType.detect?.matcher
			const matcher = Array.isArray(fileType.detect?.matcher)
				? fileType.detect?.matcher
				: [fileType.detect?.matcher!]

			if (
				fileExtensions &&
				extension &&
				!fileExtensions.includes(extension)
			)
				continue

			if (hasScope) {
				if (
					this.prefixMatchers(
						this.projectConfig,
						packTypes,
						scope!
					).some((scope) => filePath.startsWith(scope))
				)
					return fileType
			} else if (hasMatcher) {
				if (
					isMatch(
						filePath,
						this.prefixMatchers(
							this.projectConfig,
							packTypes,
							matcher!
						)
					)
				) {
					return fileType
				}
			} else {
				console.log(fileType)
				throw new Error(
					`Invalid file definition, no "detect" properties`
				)
			}
		}
	}
	protected prefixMatchers(
		config: ProjectConfig | undefined,
		packTypes: TPackTypeId[],
		matchers: string[]
	) {
		if (!config) return []

		if (packTypes.length === 0)
			return matchers.map((matcher) =>
				config.getPackFilePath(undefined, matcher)
			)

		const prefixed: string[] = []

		for (const packType of packTypes) {
			for (const matcher of matchers) {
				prefixed.push(config.getPackFilePath(packType, matcher))
			}
		}

		return prefixed
	}

	getIds() {
		const ids = []

		for (const fileType of this.fileTypes) {
			ids.push(fileType.id)
		}

		return ids
	}

	/**
	 * Guess the file path of a file given a file handle
	 */
	async guessFolder(fileHandle: AnyFileHandle) {
		// Helper function
		const getStartPath = (scope: string | string[]) => {
			let startPath = Array.isArray(scope) ? scope[0] : scope
			if (!startPath.endsWith('/')) startPath += '/'

			return startPath
		}

		// 1. Guess based on file extension
		const extension = `.${fileHandle.name.split('.').pop()!}`
		for (const { detect = {} } of this.fileTypes) {
			if (!detect.scope) continue
			if (detect.fileExtensions?.includes(extension))
				return getStartPath(detect.scope)
		}

		if (!fileHandle.name.endsWith('.json')) return null

		// 2. Guess based on json file content
		const file = await fileHandle.getFile()
		let json: any
		try {
			json = json5.parse(await file.text())
		} catch {
			return null
		}

		for (const { type, detect } of this.fileTypes) {
			if (typeof type === 'string' && type !== 'json') continue

			const { scope, fileContent } = detect ?? {}
			if (!scope || !fileContent) continue

			if (!hasAnyPath(json, fileContent)) continue

			return getStartPath(scope)
		}

		return null
	}

	/**
	 * Get the file type/file definition id for the provided file path
	 * @param filePath file path to get the file type of
	 */
	getId(filePath: string) {
		return this.getGlobal(filePath)?.id ?? 'unknown'
	}

	/**
	 * A function that tests whether a file path is a JSON file respecting the meta.language property & file extension
	 * @returns Whether a file is considered a "JSON" file
	 */
	isJsonFile(filePath: string) {
		const language = this.getGlobal(filePath)?.meta?.language
		return language ? language === 'json' : filePath.endsWith('.json')
	}

	/**
	 * Get a JSON schema array that can be used to set Monaco's JSON defaults
	 */
	getMonacoSchemaArray() {
		return this.fileTypes
			.map(
				({ detect = {}, schema }) =>
					<IMonacoSchemaArrayEntry>{
						fileMatch: Array.isArray(detect.matcher)
							? [...detect.matcher]
							: [detect.matcher],
						uri: schema,
					}
			)
			.flat()
	}

	protected lCacheFiles: Record<string, ILightningInstruction[] | string> = {}
	async loadLightningCache(dataLoader: DataLoader) {
		for (const fileType of this.fileTypes) {
			if (!fileType.lightningCache) continue
			const filePath = `data/packages/minecraftBedrock/lightningCache/${fileType.lightningCache}`

			if (fileType.lightningCache.endsWith('.json'))
				this.lCacheFiles[
					fileType.lightningCache
				] = await dataLoader.readJSON(filePath)
			else if (fileType.lightningCache.endsWith('.js'))
				this.lCacheFiles[
					fileType.lightningCache
				] = await dataLoader
					.readFile(filePath)
					.then((file) => file.text())
			else
				throw new Error(
					`Invalid lightningCache file format: ${fileType.lightningCache}`
				)
		}
	}

	async getLightningCache(filePath: string) {
		const { lightningCache } = this.getGlobal(filePath) ?? {}
		if (!lightningCache) return []

		return this.lCacheFiles[lightningCache] ?? []
	}

	protected packSpiderFiles: {
		id: string
		packSpider: IPackSpiderFile
	}[] = []
	async loadPackSpider(dataLoader: DataLoader) {
		this.packSpiderFiles.push(
			...(<{ id: string; packSpider: IPackSpiderFile }[]>(
				await Promise.all(
					this.fileTypes
						.map(({ id, packSpider }) => {
							if (!packSpider) return
							return dataLoader
								.readJSON(
									`data/packages/minecraftBedrock/packSpider/${packSpider}`
								)
								.then((json) => ({
									id,
									packSpider: json,
								}))
						})
						.filter((data) => data !== undefined)
				)
			))
		)
	}
	async getPackSpiderData() {
		return this.packSpiderFiles
	}
}
