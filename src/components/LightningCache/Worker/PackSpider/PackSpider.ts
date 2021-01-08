import { FileType } from '@/appCycle/FileType'
import { LightningStore } from '../LightningStore'
import { PackIndexerService } from '../Main'

export interface IPackSpiderFile {
	connect?: IFileDescription[]
	includeFiles?: string[]
	sharedFiles?: string[]
}
export interface IFileDescription {
	find: string | string[]
	where: string
	matches: string
}

export class PackSpider {
	public readonly packSpiderFiles: Record<string, IPackSpiderFile> = {}

	constructor(
		protected packIndexer: PackIndexerService,
		public readonly lightningStore: LightningStore
	) {}

	async setup(filePaths: string[]) {
		const response = await FileType.getPackSpiderData()
		response.forEach(
			({ id, packSpider }) => (this.packSpiderFiles[id] = packSpider)
		)

		for (const filePath of filePaths) {
			await File.create(filePath, this)
			this.packIndexer.progress.addToCurrent()
		}
	}

	async updateFile(filePath: string) {
		await File.create(filePath, this, true)
	}
}

export const fileStore: Record<string, File> = {}
export class File {
	static async create(
		filePath: string,
		packSpider: PackSpider,
		forceUpdate = false
	) {
		if (fileStore[filePath] !== undefined && !forceUpdate)
			return <File>fileStore[filePath]

		// Loot tables/trade tables/textures etc. are all scoped differently within Minecraft
		// (bridge. needs a start of BP/ & RP/)
		const pathStart = filePath.split('/').shift()
		const fileType = await FileType.getId(filePath)
		const packSpiderFile = packSpider.packSpiderFiles[fileType] ?? {}

		// Load cache data of current file
		const { data: cacheData = {} } = await packSpider.lightningStore.get(
			filePath,
			fileType
		)

		// Directly referenced files
		const cacheKeysToInclude =
			<string[]>(
				packSpiderFile.includeFiles
					?.map(cacheKey => cacheData[cacheKey] ?? [])
					.flat()
			) ?? []
		const connectedFiles = await Promise.all(
			cacheKeysToInclude.map(filePath =>
				File.create(`${pathStart}/${filePath}`, packSpider)
			)
		)

		// Dynamically referenced files
		const promises =
			packSpiderFile.connect?.map(({ find, where, matches }) => {
				if (!Array.isArray(find)) find = [find]
				const matchesOneOf = cacheData[matches] ?? []

				return packSpider.lightningStore.findMultiple(
					find,
					where,
					matchesOneOf
				)
			}) ?? []
		connectedFiles.push(
			...(await Promise.all(
				(await Promise.all(promises))
					.flat()
					.map(filePath => File.create(filePath, packSpider))
			))
		)

		// Shared files
		connectedFiles.push(
			...(await Promise.all(
				packSpiderFile.sharedFiles?.map(filePath =>
					File.create(filePath, packSpider)
				) ?? []
			))
		)

		fileStore[filePath] = new File(filePath, connectedFiles)
		return fileStore[filePath]
	}

	constructor(protected filePath: string, protected connectedFiles: File[]) {}
}
