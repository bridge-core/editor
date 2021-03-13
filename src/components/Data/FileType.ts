import { isMatch } from 'micromatch'
import type { ILightningInstruction } from '/@/components/PackIndexer/Worker/Main'
import type { IPackSpiderFile } from '/@/components/PackIndexer/Worker/PackSpider/PackSpider'
import type { FileSystem } from '/@/components/FileSystem/FileSystem'
import { Signal } from '/@/components/Common/Event/Signal'
import type { CompareOperator } from 'compare-versions'

/**
 * Describes the structure of a file definition
 */
export interface IFileType {
	id: string
	icon?: string
	scope: string | string[]
	matcher: string | string[]
	schema: string
	types: (string | [string, { targetVersion: [CompareOperator, string] }])[]
	packSpider: string
	lightningCache: string
	formatOnSaveCapable: boolean
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
	let fileSystem: FileSystem
	export const ready = new Signal<void>()

	export async function setup(fs: FileSystem) {
		if (fileTypes.length > 0) return
		fileSystem = fs

		const basePath = 'data/packages/fileDefinition'
		const dirents = await fs.readdir(basePath, { withFileTypes: true })
		for (const dirent of dirents) {
			if (dirent.kind === 'file')
				fileTypes.push(await fs.readJSON(`${basePath}/${dirent.name}`))
		}

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
	export function setPluginFileTypes(fileDefs: IFileType[]) {
		pluginFileTypes.clear()
		fileDefs.forEach((fileDef) => pluginFileTypes.add(fileDef))
	}

	/**
	 * Get the file definition data for the given file path
	 * @param filePath file path to fetch file definition for
	 */
	export function get(filePath?: string, searchFileType?: string) {
		for (const fileType of fileTypes) {
			if (searchFileType === fileType.id) return fileType
			else if (!filePath) continue

			if (fileType.scope) {
				if (typeof fileType.scope === 'string') {
					if (filePath.startsWith(fileType.scope)) return fileType
				} else {
					if (
						fileType.scope.some((scope) =>
							filePath.startsWith(scope)
						)
					)
						return fileType
				}
			} else if (
				typeof fileType.matcher === 'string' &&
				isMatch(filePath, fileType.matcher)
			) {
				return fileType
			} else {
				for (const matcher of fileType.matcher)
					if (isMatch(filePath, matcher)) return fileType
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
				({ matcher, schema }) =>
					<IMonacoSchemaArrayEntry>{
						fileMatch: Array.isArray(matcher)
							? [...matcher]
							: [matcher],
						uri: schema,
					}
			)
			.flat()
	}

	const lCacheFiles: Record<string, ILightningInstruction[] | string> = {}
	export async function getLightningCache(filePath: string) {
		const { lightningCache } = get(filePath) ?? {}
		if (!lightningCache) return []

		if (lCacheFiles[lightningCache]) return lCacheFiles[lightningCache]

		if (lightningCache.endsWith('.json')) {
			lCacheFiles[lightningCache] = <ILightningInstruction[]>(
				await fileSystem.readJSON(
					`data/packages/lightningCache/${lightningCache}`
				)
			)
		} else if (lightningCache.endsWith('.js')) {
			const textFile = await fileSystem.readFile(
				`data/packages/lightningCache/${lightningCache}`
			)
			lCacheFiles[lightningCache] = await textFile.text()
		} else {
			throw new Error(
				`Unknown lightning cache file format: "${lightningCache}"`
			)
		}

		return lCacheFiles[lightningCache]
	}

	export async function getPackSpiderData() {
		return <{ id: string; packSpider: IPackSpiderFile }[]>await Promise.all(
			fileTypes
				.map(({ id, packSpider }) => {
					if (!packSpider) return
					return fileSystem
						.readJSON(`data/packages/packSpider/${packSpider}`)
						.then((json) => ({
							id,
							packSpider: json,
						}))
				})
				.filter((data) => data !== undefined)
		)
	}
}
