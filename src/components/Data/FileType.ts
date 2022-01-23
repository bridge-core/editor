import type { ILightningInstruction } from '/@/components/PackIndexer/Worker/Main'
import type { IPackSpiderFile } from '/@/components/PackIndexer/Worker/PackSpider/PackSpider'
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
					).map((fileMatch) => encodeURI(fileMatch)),
					uri: schema,
				}
			})
			.filter((schemaEntry) => schemaEntry !== null)
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
		const { lightningCache } = this.get(filePath) ?? {}
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
