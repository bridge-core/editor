import { walkObject } from 'bridge-common-utils'
import { LightningStore } from '../LightningCache/LightningStore'
import { PackIndexerService } from '../Main'

export interface IPackSpiderInstruction {
	connect?: IFileDescription[]
	includeFiles?: string[]
	includeFromFiles?: {
		from: string // filePath
		take: string[] // ['texture_data', '@texture', 'textures']
		prefix?: string
		suffix?: string
	}[]
	sharedFiles?: string[]
	provideDiagnostics?: ({
		if: IConditionalFileDescription
	} & IFileDiagnostic)[]
}

export interface IFileDescription {
	find: string | string[]
	where: string
	matches: string
	shouldFindMultiple?: boolean
}
export interface IConditionalFileDescription extends IFileDescription {
	not?: boolean
}
export interface IFileDiagnostic {
	type?: 'error' | 'warning' | 'info'
	opacity?: number
	text: string
	icon: string
}

export class PackSpider {
	public readonly packSpiderFiles = new Map<string, PackSpiderFile>()

	constructor(
		public readonly packIndexer: PackIndexerService,
		public readonly lightningStore: LightningStore
	) {}

	get fileType() {
		return this.packIndexer.fileType
	}

	async setup(filePaths: string[]) {
		// console.log(await this.fileType.getPackSpiderData())
		// TODO(Dash): Re-enable pack spider
		// if (this.packIndexer.getOptions().disablePackSpider || true) return

		const packSpiderData = await this.fileType.getPackSpiderData()
		for (const fileTypeId in packSpiderData) {
			const instructions = packSpiderData[fileTypeId]

			const allFilesOfType = this.lightningStore.allFiles(fileTypeId)

			for (const filePath of allFilesOfType) {
				const packSpiderFile = new PackSpiderFile({
					lightningStore: this.lightningStore,
					filePath: filePath,
					fileType: fileTypeId,
					instructions,
				})
				this.packSpiderFiles.set(filePath, packSpiderFile)
			}
		}
	}

	getDiagnostics(filePath: string) {
		const packSpiderFile = this.packSpiderFiles.get(filePath)
		if (!packSpiderFile) return []

		return packSpiderFile.provideDiagnostics()
	}
	getConnectedFiles(filePath: string) {
		const packSpiderFile = this.packSpiderFiles.get(filePath)
		if (!packSpiderFile) return []

		return [...packSpiderFile.loadAllConnected()]
	}

	async updateFile(filePath: string) {
		// TODO(Dash): Re-enable pack spider
		// await File.create(filePath, this, true)
	}
}

export interface IPackSpiderFileOptions {
	lightningStore: LightningStore
	filePath: string
	fileType: string
	instructions: IPackSpiderInstruction
}
export class PackSpiderFile {
	protected lightningStore: LightningStore
	protected filePath: string
	protected fileType: string
	protected instructions: IPackSpiderInstruction
	protected dependencies = new Map<string, Set<string>>()

	constructor({
		lightningStore,
		filePath,
		fileType,
		instructions,
	}: IPackSpiderFileOptions) {
		this.lightningStore = lightningStore
		this.filePath = filePath
		this.fileType = fileType
		this.instructions = instructions
	}

	get cacheData() {
		return this.lightningStore.get(this.filePath).data ?? {}
	}

	loadAllConnected() {
		return new Set([
			...this.loadConnected(),
			...this.loadDirectReferences(),
		])
	}

	/**
	 * Load direct references from the cache to files such as loot table or texture path
	 * @returns Set<string>
	 */
	protected loadDirectReferences() {
		return new Set(
			<string[]>this.instructions.includeFiles
				?.map((cacheKey) => {
					if (cacheKey) return this.cacheData[cacheKey] ?? []
				})
				.flat() ?? []
		)
	}

	/**
	 * Load files that can be connected to this file via a matching cache value
	 * Examples: Client entity identifier <-> server entity identifier
	 * @param connect Instructions on which files to connect
	 * @returns Set<string>
	 */
	protected loadConnected(connect = this.instructions.connect) {
		const connectedFiles = new Set<string>()

		for (let { find, where, matches, shouldFindMultiple } of connect ??
			[]) {
			if (!Array.isArray(find)) find = [find]
			const matchesOneOf = this.cacheData[matches] ?? []

			const foundFilePaths = this.lightningStore.findMultiple(
				find,
				where,
				matchesOneOf,
				shouldFindMultiple ?? true
			)
			for (const foundFilePath of foundFilePaths) {
				if (foundFilePath !== this.filePath)
					connectedFiles.add(foundFilePath)
			}
		}

		return connectedFiles
	}

	provideDiagnostics() {
		const diagnostics: IFileDiagnostic[] = []

		for (let { if: ifCondition, ...diagnostic } of this.instructions
			.provideDiagnostics ?? []) {
			const matches = this.loadConnected([ifCondition])

			if (ifCondition.not) {
				if (matches.size > 0) continue

				diagnostics.push(diagnostic)
			} else {
				if (matches.size === 0) continue

				diagnostics.push(diagnostic)
			}
		}

		return diagnostics
	}

	addDependency(fileType: string, filePath: string) {
		if (!this.dependencies.has(fileType))
			this.dependencies.set(fileType, new Set(filePath))
		else this.dependencies.get(fileType)!.add(filePath)
	}
}

// export class File {
// 	protected identifier?: string
// 	protected parents = new Set<File>()
// 	protected _connectedFiles: Set<File>

// 	constructor(public readonly filePath: string, parents: File[] = []) {
// 		parents.forEach((parent) => this.addParent(parent))

// 		this._connectedFiles = new Set()
// 	}
// 	get connectedFiles() {
// 		return this._connectedFiles
// 	}

// 	static async create(
// 		filePath: string,
// 		packSpider: PackSpider,
// 		forceUpdate = false
// 	) {
// 		const fileType = packSpider.packIndexer.fileType.getId(filePath)
// 		const { packPath: packType } = <any>(
// 			packSpider.packIndexer.packType.get(filePath)
// 		) ?? { packPath: 'unknown' }

// 		const storedFile = fileStore[packType]?.[fileType]?.[filePath]
// 		if (storedFile !== undefined) {
// 			if (!forceUpdate) return storedFile
// 			else
// 				storedFile.connectedFiles.forEach((file) =>
// 					file.removeParent(storedFile)
// 				)
// 		}

// 		const packSpiderFile = packSpider.packSpiderFiles[fileType] ?? {}

// 		// Load cache data of current file
// 		const { data: cacheData = {} } = packSpider.lightningStore.get(
// 			filePath,
// 			fileType
// 		)

// 		const connectedFiles: string[] = []
// 		// Directly referenced files (includeFiles)
// 		const cacheKeysToInclude = <string[]>packSpiderFile.includeFiles
// 				?.map((cacheKey) => {
// 					if (cacheKey) return cacheData[cacheKey] ?? []
// 				})
// 				.flat() ?? []
// 		for (const foundFilePath of cacheKeysToInclude) {
// 			if (foundFilePath !== filePath) connectedFiles.push(foundFilePath)
// 		}

// 		// Dynamically referenced files (connect)
// 		for (let {
// 			find,
// 			where,
// 			matches,
// 			shouldFindMultiple,
// 		} of packSpiderFile.connect ?? []) {
// 			if (!Array.isArray(find)) find = [find]
// 			const matchesOneOf = cacheData[matches] ?? []

// 			const foundFilePaths = packSpider.lightningStore.findMultiple(
// 				find,
// 				where,
// 				matchesOneOf,
// 				shouldFindMultiple ?? true
// 			)
// 			for (const foundFilePath of foundFilePaths) {
// 				if (foundFilePath !== filePath)
// 					connectedFiles.push(foundFilePath)
// 			}
// 		}

// 		// Shared files (sharedFiles)
// 		for (const foundFilePath of packSpiderFile.sharedFiles ?? []) {
// 			if (foundFilePath !== filePath) connectedFiles.push(foundFilePath)
// 		}

// 		// include from files (includeFromFiles)
// 		for (const {
// 			from,
// 			take,
// 			prefix = '',
// 			suffix = '',
// 		} of packSpiderFile.includeFromFiles ?? []) {
// 			const transformedTake = take
// 				.map((t) => {
// 					if (!t.startsWith('@')) return t

// 					const data = cacheData[t.slice(1)]
// 					if (!data) return 'undefined'
// 					else if (data.length === 1) return data[0]

// 					return `*{${data.join('|')}}`
// 				})
// 				.join('/')
// 			const json = await packSpider.packIndexer.fileSystem.readJSON(from)

// 			walkObject(transformedTake, json, (data) => {
// 				if (Array.isArray(data))
// 					connectedFiles.push(
// 						...data.map((d) => `${prefix}${d}${suffix}`)
// 					)
// 				else if (typeof data === 'string')
// 					connectedFiles.push(`${prefix}${data}${suffix}`)
// 			})
// 		}

// 		const file = new File(
// 			filePath,
// 			forceUpdate ? [...(storedFile?.parents ?? [])] : undefined
// 		)
// 		await file.addConnectedFiles(connectedFiles, packSpider)
// 		file.setIdentifier(cacheData.identifier)

// 		if (!fileStore[packType]) fileStore[packType] = {}
// 		if (!fileStore[packType][fileType]) fileStore[packType][fileType] = {}
// 		fileStore[packType][fileType][filePath] = file
// 		return fileStore[packType][fileType][filePath]
// 	}

// 	async addConnectedFiles(filePaths: string[], packSpider: PackSpider) {
// 		for (const filePath of filePaths) {
// 			const file = await File.create(filePath, packSpider)
// 			this.connectedFiles.add(file)
// 			file.addParent(this)
// 		}
// 	}

// 	toDirectory() {
// 		const dirFiles: IFile[] = []
// 		const deepFiles = this.deepConnectedFiles
// 		deepFiles.add(this)

// 		deepFiles.forEach((file) =>
// 			dirFiles.push({
// 				kind: 'file',
// 				name: file.fileName,
// 				filePath: file.filePath,
// 				identifierName: file.identifierName,
// 				displayName: file.identifierName || file.fileName,
// 			})
// 		)

// 		return dirFiles
// 	}
// 	get deepConnectedFiles() {
// 		const deepFiles = new Set<File>()

// 		this.connectedFiles.forEach((file) => {
// 			deepFiles.add(file)
// 			file.deepConnectedFiles.forEach((deepFile) =>
// 				deepFiles.add(deepFile)
// 			)
// 		})

// 		return deepFiles
// 	}
// 	get identifierName() {
// 		return this.identifier
// 	}
// 	get fileName() {
// 		const arrPath = this.filePath.split('/')
// 		return arrPath[arrPath.length - 1]
// 	}
// 	get isFeatureFolder() {
// 		return this.parents.size === 0
// 	}

// 	addParent(parent: File) {
// 		this.parents.add(parent)
// 	}
// 	removeParent(parent: File) {
// 		this.parents.delete(parent)
// 	}

// 	setIdentifier(id?: string[] | string) {
// 		if (typeof id === 'string') this.identifier = id
// 		if (id?.length === 1) {
// 			this.identifier = id[0]
// 			return
// 		}

// 		const path = this.filePath.split('/')

// 		// Top level files should still be handled correctly
// 		if (path.length <= 2) {
// 			this.identifier = this.fileName
// 		} else {
// 			path.shift()
// 			path.shift()
// 			this.identifier = path.join('/')
// 		}
// 	}
// }
