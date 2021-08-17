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

/**
 * Describes the structure of a file definition
 */
export interface IFileType {
	type?: 'json' | 'text' | 'nbt'
	id: string
	icon?: string
	detect?: {
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
export namespace FileType {
	const pluginFileTypes = new Set<IFileType>()
	let fileTypes: IFileType[] = []
	export const ready = new Signal<void>()

	export async function setup(dataLoader: DataLoader) {
		if (fileTypes.length > 0) return
		await dataLoader.fired

		const basePath = 'data/packages/minecraftBedrock/fileDefinition'
		const dirents = await dataLoader.getDirectoryHandle(basePath)

		for await (const dirent of dirents.values()) {
			if (dirent.kind === 'file')
				fileTypes.push(
					await dataLoader.readJSON(`${basePath}/${dirent.name}`)
				)
		}

		loadLightningCache(dataLoader)
		loadPackSpider(dataLoader)

		ready.dispatch()
	}
	export function addPluginFileType(fileDef: IFileType) {
		pluginFileTypes.add(fileDef)

		return {
			dispose: () => pluginFileTypes.delete(fileDef),
		}
	}
	export function getPluginFileTypes() {
		return [...pluginFileTypes.values()]
	}
	export function setPluginFileTypes(fileDefs: IFileType[] = []) {
		pluginFileTypes.clear()
		fileDefs.forEach((fileDef) => pluginFileTypes.add(fileDef))
	}

	/**
	 * Get the file definition data for the given file path
	 * @param filePath file path to fetch file definition for
	 */
	export function get(filePath?: string, searchFileType?: string) {
		const extension = filePath ? extname(filePath) : null

		for (const fileType of fileTypes) {
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
	export function getIds() {
		const ids = []

		for (const fileType of fileTypes) {
			ids.push(fileType.id)
		}

		return ids
	}

	/**
	 * Guess the file path of a file given a file handle
	 */
	export async function guessFolder(fileHandle: AnyFileHandle) {
		// Helper function
		const getStartPath = (scope: string | string[]) => {
			let startPath = Array.isArray(scope) ? scope[0] : scope
			if (!startPath.endsWith('/')) startPath += '/'

			return startPath
		}

		// 1. Guess based on file extension
		const extension = `.${fileHandle.name.split('.').pop()!}`
		for (const { detect = {} } of fileTypes) {
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

		for (const { type, detect } of fileTypes) {
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
	export function getId(filePath: string) {
		return get(filePath)?.id ?? 'unknown'
	}

	/**
	 * Get a JSON schema array that can be used to set Monaco's JSON defaults
	 */
	export function getMonacoSchemaArray() {
		return fileTypes
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

	const lCacheFiles: Record<string, ILightningInstruction[] | string> = {}

	async function loadLightningCache(dataLoader: DataLoader) {
		for (const fileType of fileTypes) {
			if (!fileType.lightningCache) continue
			const filePath = `data/packages/minecraftBedrock/lightningCache/${fileType.lightningCache}`

			if (fileType.lightningCache.endsWith('.json'))
				lCacheFiles[
					fileType.lightningCache
				] = await dataLoader.readJSON(filePath)
			else if (fileType.lightningCache.endsWith('.js'))
				lCacheFiles[
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

	export async function getLightningCache(filePath: string) {
		const { lightningCache } = get(filePath) ?? {}
		if (!lightningCache) return []

		return lCacheFiles[lightningCache] ?? []
	}

	const packSpiderFiles: { id: string; packSpider: IPackSpiderFile }[] = []
	async function loadPackSpider(dataLoader: DataLoader) {
		packSpiderFiles.push(
			...(<{ id: string; packSpider: IPackSpiderFile }[]>(
				await Promise.all(
					fileTypes
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
	export async function getPackSpiderData() {
		return packSpiderFiles
	}
}
