import { isMatch } from 'micromatch'
import { ILightningInstruction } from '@/components/PackIndexer/Worker/Main'
import { IPackSpiderFile } from '@/components/PackIndexer/Worker/PackSpider/PackSpider'
import { FileSystem } from '@/components/FileSystem/Main'
import json5 from 'json5'

/**
 * Describes the structure of a file definition
 */
interface IFileType {
	id: string
	icon?: string
	matcher: string | string[]
	schema: string
	packSpider: string
	lightningCache: string
}

/**
 * Used for return type of FileType.getMonacoSchemaArray() function
 */
interface IMonacoSchemaArrayEntry {
	fileMatch?: string[]
	uri: string
	schema?: any
}

/**
 * Utilities around bridge.'s file definitions
 */
export namespace FileType {
	const baseUrl =
		'https://raw.githubusercontent.com/bridge-core/data/next/packages/'
	let fileTypes: IFileType[] = []

	export async function setup(fileSystem: FileSystem) {
		if (fileTypes.length > 0) return

		fileTypes = <IFileType[]>(
			await fileSystem.readJSON('data/packages/fileDefinitions.json')
		)
	}

	/**
	 * Get the file definition data for the given file path
	 * @param filePath file path to fetch file definition for
	 */
	export function get(filePath?: string, searchFileType?: string) {
		for (const fileType of fileTypes) {
			if (searchFileType === fileType.id) return fileType
			else if (!filePath) continue

			if (
				typeof fileType.matcher === 'string' &&
				isMatch(filePath, fileType.matcher)
			)
				return fileType

			for (const matcher of fileType.matcher)
				if (isMatch(filePath, matcher)) return fileType
		}
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
	export function getMonacoSchemaArray(): IMonacoSchemaArrayEntry[] {
		return fileTypes
			.map(({ matcher, schema }) => ({
				fileMatch: Array.isArray(matcher) ? [...matcher] : [matcher],
				uri: schema,
			}))
			.flat()
	}

	const lCacheFiles: Record<string, ILightningInstruction[]> = {}
	export async function getLightningCache(filePath: string) {
		const { lightningCache } = get(filePath) ?? {}
		if (!lightningCache) return []

		if (lCacheFiles[lightningCache]) return lCacheFiles[lightningCache]
		const response = await fetch(
			`${baseUrl}lightningCache/${lightningCache}`
		)

		lCacheFiles[lightningCache] = json5.parse(
			await response.text()
		) as ILightningInstruction[]
		return lCacheFiles[lightningCache]
	}

	export async function getPackSpiderData() {
		return <{ id: string; packSpider: IPackSpiderFile }[]>await Promise.all(
			fileTypes
				.map(({ id, packSpider }) => {
					if (!packSpider) return
					return fetch(`${baseUrl}packSpider/${packSpider}`)
						.then(response => response.text())
						.then(jsonStr => ({
							id,
							packSpider: json5.parse(jsonStr),
						}))
				})
				.filter(data => data !== undefined)
		)
	}
}
