import type { ILightningInstruction } from '/@/components/PackIndexer/Worker/Main'
import type { IPackSpiderInstruction } from '/@/components/PackIndexer/Worker/PackSpider/PackSpider'
import { Signal } from '/@/components/Common/Event/Signal'
import { DataLoader } from './DataLoader'
import { isMatch } from 'bridge-common-utils'
import type { ProjectConfig } from '/@/components/Projects/Project/Config'
import { FileType } from 'mc-project-core'

export type { IFileType, IDefinition } from 'mc-project-core'

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
export class FileTypeLibrary extends FileType<DataLoader> {
	public ready = new Signal<void>()

	constructor(projectConfig?: ProjectConfig) {
		super(projectConfig, isMatch)
	}

	setProjectConfig(projectConfig: ProjectConfig) {
		this.projectConfig = projectConfig
	}

	async setup(dataLoader: DataLoader) {
		if (this.fileTypes.length > 0) return
		await dataLoader.fired

		this.fileTypes = await dataLoader.readJSON(
			'data/packages/minecraftBedrock/fileDefinitions.json'
		)

		this.loadLightningCache(dataLoader)
		this.loadPackSpider(dataLoader)

		this.ready.dispatch()
	}

	/**
	 * Get a JSON schema array that can be used to set Monaco's JSON defaults
	 */
	getMonacoSchemaEntries() {
		return <IMonacoSchemaArrayEntry[]>this.fileTypes
			.map(({ detect = {}, schema }) => {
				if (!detect.matcher) return null

				const packTypes =
					detect?.packType === undefined
						? []
						: Array.isArray(detect?.packType)
						? detect?.packType
						: [detect?.packType]

				return {
					fileMatch: this.prefixMatchers(
						packTypes,
						Array.isArray(detect.matcher)
							? [...detect.matcher]
							: [detect.matcher]
					).map((fileMatch) =>
						encodeURI(fileMatch)
							// Monaco doesn't like these characters in fileMatch
							.replaceAll(/;|,|@|&|=|\+|\$|\.|!|'|\(|\)|#/g, '*')
					),
					uri: schema,
				}
			})
			.filter((schemaEntry) => schemaEntry !== null)
			.flat()
	}

	protected lCacheFiles: Record<string, ILightningInstruction[] | string> = {}
	protected lCacheFilesLoaded = new Signal<void>()
	async loadLightningCache(dataLoader: DataLoader) {
		const lightningCache = await dataLoader.readJSON(
			`data/packages/minecraftBedrock/lightningCaches.json`
		)

		const findCacheFile = (fileName: string) =>
			Object.entries(lightningCache).find(([filePath]) =>
				filePath.endsWith(fileName)
			)

		for (const fileType of this.fileTypes) {
			if (!fileType.lightningCache) continue

			const [filePath, cacheFile] =
				findCacheFile(fileType.lightningCache) ?? []
			if (!filePath) {
				throw new Error(
					`Lightning cache file "${fileType.lightningCache}" for file type "${fileType.id}" not found`
				)
			}

			this.lCacheFiles[fileType.lightningCache] = <
				string | ILightningInstruction[]
			>cacheFile
		}
		this.lCacheFilesLoaded.dispatch()
	}

	async getLightningCache(filePath: string) {
		const { lightningCache } = this.get(filePath) ?? {}
		if (!lightningCache) return []

		await this.lCacheFilesLoaded.fired

		return this.lCacheFiles[lightningCache] ?? []
	}

	protected packSpiderFiles: Record<string, IPackSpiderInstruction> = {}
	protected packSpiderFilesLoaded = new Signal<void>()
	async loadPackSpider(dataLoader: DataLoader) {
		const packSpiderFiles = await dataLoader.readJSON(
			`data/packages/minecraftBedrock/packSpiders.json`
		)

		this.packSpiderFiles = Object.fromEntries(
			<[string, IPackSpiderInstruction][]>this.fileTypes
				.map(({ id, packSpider }) => {
					if (!packSpider) return

					return [
						id,
						packSpiderFiles[
							`file:///data/packages/minecraftBedrock/packSpider/${packSpider}`
						],
					]
				})
				.filter((data) => data !== undefined)
		)

		this.packSpiderFilesLoaded.dispatch()
	}
	async getPackSpiderData() {
		await this.packSpiderFilesLoaded.fired

		return this.packSpiderFiles
	}
}
