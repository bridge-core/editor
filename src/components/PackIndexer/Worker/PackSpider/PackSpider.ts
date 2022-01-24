import { walkObject } from 'bridge-common-utils'
import { LightningStore } from '../LightningCache/LightningStore'
import { PackIndexerService } from '../Main'

export interface IPackSpiderFile {
	connect?: IFileDescription[]
	includeFiles?: string[]
	includeFromFiles?: {
		from: string // filePath
		take: string[] // ['texture_data', '@texture', 'textures']
		prefix?: string
		suffix?: string
	}[]
	sharedFiles?: string[]
}
export interface IFileDescription {
	find: string | string[]
	where: string
	matches: string
	shouldFindMultiple?: boolean
}

export class PackSpider {
	public readonly packSpiderFiles: Record<string, IPackSpiderFile> = {}

	constructor(
		public readonly packIndexer: PackIndexerService,
		public readonly lightningStore: LightningStore
	) {}

	async setup(filePaths: string[]) {
		// TODO(Dash): Re-enable pack spider
		if (this.packIndexer.getOptions().disablePackSpider || true) return

		fileStore = {}
		const response = await this.packIndexer.fileType.getPackSpiderData()
		response.forEach(
			({ id, packSpider }) => (this.packSpiderFiles[id] = packSpider)
		)

		for (const filePath of filePaths) {
			await File.create(filePath, this)
			this.packIndexer.progress.addToCurrent()
		}
	}

	async updateFile(filePath: string) {
		// TODO(Dash): Re-enable pack spider
		// await File.create(filePath, this, true)
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
	displayName?: string
	identifierName?: string
	filePath: string
}
export let fileStore: Record<string, Record<string, Record<string, File>>> = {}
export function getFileStoreDirectory(packType: string) {
	const folders: (IDirectory | IFile)[] = []

	for (const fileType in fileStore[packType]) {
		const cFolders = getCategoryDirectory(packType, fileType)

		if (cFolders.length > 0)
			folders.push({ kind: 'directory', name: fileType })
	}

	return folders
}
export function getCategoryDirectory(packType: string, fileType: string) {
	const folders: (IDirectory | IFile)[] = []

	for (const filePath in fileStore[packType][fileType] ?? {}) {
		const file = fileStore[packType][fileType][filePath]
		if (!file?.isFeatureFolder) continue

		const files = file.toDirectory()

		if (files.length === 1) {
			folders.push(
				...files.map((file) => ({
					...file,
					displayName: file.identifierName || file.name,
				}))
			)
		} else {
			folders.push({
				kind: 'directory',
				displayName: file.identifierName || file.fileName,
				name: file.filePath,
				path: [packType, fileType, file.filePath],
			})
		}
	}

	return folders
}
export class File {
	protected identifier?: string
	protected parents = new Set<File>()
	protected _connectedFiles: Set<File>

	constructor(public readonly filePath: string, parents: File[] = []) {
		parents.forEach((parent) => this.addParent(parent))

		this._connectedFiles = new Set()
	}
	get connectedFiles() {
		return this._connectedFiles
	}

	static async create(
		filePath: string,
		packSpider: PackSpider,
		forceUpdate = false
	) {
		const fileType = packSpider.packIndexer.fileType.getId(filePath)
		const { packPath: packType } = <any>(
			packSpider.packIndexer.packType.get(filePath)
		) ?? { packPath: 'unknown' }

		const storedFile = fileStore[packType]?.[fileType]?.[filePath]
		if (storedFile !== undefined) {
			if (!forceUpdate) return storedFile
			else
				storedFile.connectedFiles.forEach((file) =>
					file.removeParent(storedFile)
				)
		}

		const packSpiderFile = packSpider.packSpiderFiles[fileType] ?? {}

		// Load cache data of current file
		const { data: cacheData = {} } = packSpider.lightningStore.get(
			filePath,
			fileType
		)

		const connectedFiles: string[] = []
		// Directly referenced files (includeFiles)
		const cacheKeysToInclude = <string[]>packSpiderFile.includeFiles
				?.map((cacheKey) => {
					if (cacheKey) return cacheData[cacheKey] ?? []
				})
				.flat() ?? []
		for (const foundFilePath of cacheKeysToInclude) {
			if (foundFilePath !== filePath) connectedFiles.push(foundFilePath)
		}

		// Dynamically referenced files (connect)
		for (let {
			find,
			where,
			matches,
			shouldFindMultiple,
		} of packSpiderFile.connect ?? []) {
			if (!Array.isArray(find)) find = [find]
			const matchesOneOf = cacheData[matches] ?? []

			const foundFilePaths = packSpider.lightningStore.findMultiple(
				find,
				where,
				matchesOneOf,
				shouldFindMultiple ?? true
			)
			for (const foundFilePath of foundFilePaths) {
				if (foundFilePath !== filePath)
					connectedFiles.push(foundFilePath)
			}
		}

		// Shared files (sharedFiles)
		for (const foundFilePath of packSpiderFile.sharedFiles ?? []) {
			if (foundFilePath !== filePath) connectedFiles.push(foundFilePath)
		}

		// include from files (includeFromFiles)
		for (const {
			from,
			take,
			prefix = '',
			suffix = '',
		} of packSpiderFile.includeFromFiles ?? []) {
			const transformedTake = take
				.map((t) => {
					if (!t.startsWith('@')) return t

					const data = cacheData[t.slice(1)]
					if (!data) return 'undefined'
					else if (data.length === 1) return data[0]

					return `*{${data.join('|')}}`
				})
				.join('/')
			const json = await packSpider.packIndexer.fileSystem.readJSON(from)

			walkObject(transformedTake, json, (data) => {
				if (Array.isArray(data))
					connectedFiles.push(
						...data.map((d) => `${prefix}${d}${suffix}`)
					)
				else if (typeof data === 'string')
					connectedFiles.push(`${prefix}${data}${suffix}`)
			})
		}

		const file = new File(
			filePath,
			forceUpdate ? [...(storedFile?.parents ?? [])] : undefined
		)
		await file.addConnectedFiles(connectedFiles, packSpider)
		file.setIdentifier(cacheData.identifier)

		if (!fileStore[packType]) fileStore[packType] = {}
		if (!fileStore[packType][fileType]) fileStore[packType][fileType] = {}
		fileStore[packType][fileType][filePath] = file
		return fileStore[packType][fileType][filePath]
	}

	async addConnectedFiles(filePaths: string[], packSpider: PackSpider) {
		for (const filePath of filePaths) {
			const file = await File.create(filePath, packSpider)
			this.connectedFiles.add(file)
			file.addParent(this)
		}
	}

	toDirectory() {
		const dirFiles: IFile[] = []
		const deepFiles = this.deepConnectedFiles
		deepFiles.add(this)

		deepFiles.forEach((file) =>
			dirFiles.push({
				kind: 'file',
				name: file.fileName,
				filePath: file.filePath,
				identifierName: file.identifierName,
				displayName: file.identifierName || file.fileName,
			})
		)

		return dirFiles
	}
	get deepConnectedFiles() {
		const deepFiles = new Set<File>()

		this.connectedFiles.forEach((file) => {
			deepFiles.add(file)
			file.deepConnectedFiles.forEach((deepFile) =>
				deepFiles.add(deepFile)
			)
		})

		return deepFiles
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

	setIdentifier(id?: string[] | string) {
		if (typeof id === 'string') this.identifier = id
		if (id?.length === 1) {
			this.identifier = id[0]
			return
		}

		const path = this.filePath.split('/')

		// Top level files should still be handled correctly
		if (path.length <= 2) {
			this.identifier = this.fileName
		} else {
			path.shift()
			path.shift()
			this.identifier = path.join('/')
		}
	}
}
