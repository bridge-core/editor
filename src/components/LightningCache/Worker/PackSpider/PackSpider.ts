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

export interface IDirectory {
	kind: 'directory'
	name: string
	displayName?: string
	path?: string[]
}
export interface IFile {
	kind: 'file'
	name: string
	filePath: string
}
export const fileStore: Record<string, Record<string, File>> = {}
export function getFileStoreDirectory() {
	const folders: IDirectory[] = []

	for (const fileType in fileStore) {
		const cFolders = getCategoryDirectory(fileType)

		if (fileType === 'unknown' && cFolders.length === 1)
			folders.push(...cFolders)
		else if (cFolders.length > 0)
			folders.push({ kind: 'directory', name: fileType })
	}

	return folders
}
export function getCategoryDirectory(fileType: string) {
	const folders: IDirectory[] = []

	for (const filePath in fileStore[fileType] ?? {}) {
		const file = fileStore[fileType][filePath]
		if (file?.isFeatureFolder)
			folders.push({
				kind: 'directory',
				displayName: file.identifierName,
				name: file.filePath,
				path: [fileType, file.filePath],
			})
	}

	return folders
}
export class File {
	protected parents = new Set<File>()
	protected identifier: string = 'unknown'
	constructor(
		public readonly filePath: string,
		protected connectedFiles: File[],
		parents: File[] = []
	) {
		parents.forEach(parent => this.addParent(parent))
		this.connectedFiles.forEach(file => file.addParent(this))
	}

	static async create(
		filePath: string,
		packSpider: PackSpider,
		forceUpdate = false
	) {
		const fileType = await FileType.getId(filePath)
		const storedFile = fileStore[fileType]?.[filePath]
		if (storedFile !== undefined) {
			if (!forceUpdate) return storedFile
			else
				storedFile.connectedFiles.forEach(file =>
					file.removeParent(storedFile)
				)
		}

		// Loot tables/trade tables/textures etc. are all scoped differently within Minecraft
		// (bridge. needs a start of BP/ & RP/)
		const pathStart = filePath.split('/').shift()

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

		const file = new File(
			filePath,
			connectedFiles,
			forceUpdate ? [...storedFile?.parents] : undefined
		)
		file.setIdentifier(cacheData.identifier?.[0] ?? 'unknown')
		if (!fileStore[fileType]) fileStore[fileType] = {}
		fileStore[fileType][filePath] = file
		return fileStore[fileType][filePath]
	}

	toDirectory() {
		return [...new Set(this.deepConnectedFiles.concat([this]))].map(
			file => ({
				kind: 'file',
				name: file.fileName,
				filePath: file.filePath,
			})
		)
	}
	get deepConnectedFiles(): File[] {
		return this.connectedFiles.concat(
			this.connectedFiles.map(file => file.deepConnectedFiles).flat()
		)
	}
	get identifierName() {
		return this.identifier
	}
	get fileName() {
		const arrPath = this.filePath.split('/')
		return arrPath[arrPath.length - 1]
	}
	get isFeatureFolder() {
		return this.parents.size === 0
	}

	addParent(parent: File) {
		this.parents.add(parent)
	}
	removeParent(parent: File) {
		this.parents.delete(parent)
	}

	setIdentifier(id: string) {
		this.identifier = id
	}
}
