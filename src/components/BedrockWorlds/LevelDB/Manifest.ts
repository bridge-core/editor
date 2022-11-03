import { AnyDirectoryHandle, AnyFileHandle } from '../../FileSystem/Types'
import { BytewiseComparator } from './Comparators/Bytewise'
import { FileMetaData } from './FileMetaData'
import { asUsableKey } from './Key/AsUsableKey'
import { LogReader } from './LogReader'
import { ERequestState, RequestStatus } from './RequestStatus'
import { Table } from './Table/Table'
import { Uint8ArrayReader } from './Uint8ArrayUtils/Reader'
import { Version } from './Version'

enum ELogTagType {
	Comparator = 1,
	LogNumber = 2,
	NextFileNumber = 3,
	LastSequence = 4,
	CompactPointer = 5,
	DeletedFile = 6,
	NewFile = 7,
	PrevLogNumber = 9,
}

const defaultLdbOperator = 'leveldb.BytewiseComparator'

export class Manifest {
	protected logReader = new LogReader()
	protected _version?: Version
	protected comparator = new BytewiseComparator()

	get version() {
		if (!this._version)
			throw new Error(
				'Trying to access version before loading the manifest was done'
			)

		return this._version
	}

	constructor(protected dbDirectory: AnyDirectoryHandle) {}

	async load() {
		const currentManifest = await this.dbDirectory
			.getFileHandle('CURRENT')
			.then((fileHandle) => fileHandle.getFile())
			.then((file) => file.text())
		const manifestData = await this.dbDirectory
			.getFileHandle(currentManifest.trim())
			.then((fileHandle) => fileHandle.getFile())
			.then((file) => file.arrayBuffer())
			.then((data) => new Uint8Array(data))

		this._version = this.readVersionEdit(manifestData)

		// For each file in every level, create a Table that represents the backing file
		for (const files of this.version.levels.values()) {
			for (const file of files) {
				file.table = await this.createTable(file.fileNumber)
			}
		}

		if (defaultLdbOperator !== this.version.comparator)
			throw new Error(
				`Unsupported comparator: "${this.version.comparator}"`
			)

		console.log(this._version)
	}

	get(key: Uint8Array) {
		for (const level of this.version.levels.values()) {
			for (const file of level) {
				const smallestKey = asUsableKey(file.smallestKey)
				const largestKey = asUsableKey(file.largestKey)

				if (
					this.comparator.compare(smallestKey, key) < 0 &&
					this.comparator.compare(largestKey, key) > 0
				) {
					const req = file.table!.get(key)

					if (
						req.state === ERequestState.Success ||
						req.state === ERequestState.Deleted
					)
						return req
				}
			}
		}

		return RequestStatus.createNotFound()
	}
	keys() {
		const keys: Uint8Array[] = []

		this.forEachFile((file) => {
			keys.push(...file.table!.keys())
		})

		return keys
	}

	protected forEachFile(cb: (file: FileMetaData) => void) {
		for (const level of this.version.levels.values()) {
			for (const file of level) {
				cb(file)
			}
		}
	}

	protected readVersionEdit(manifestData: Uint8Array) {
		const version = new Version()

		while (true) {
			const data = this.logReader.readData(manifestData)

			if (data === null) break

			const reader = new Uint8ArrayReader(data)

			while (reader.hasUnreadBytes) {
				const logTag = reader.readVarLong()

				switch (logTag) {
					case ELogTagType.Comparator:
						version.comparator = reader.readLengthPrefixedString()
						break
					case ELogTagType.LogNumber:
						version.logNumber = reader.readVarLong()
						break
					case ELogTagType.NextFileNumber:
						version.nextFileNumber = reader.readVarLong()
						break
					case ELogTagType.LastSequence:
						version.lastSequence = reader.readVarLong()
						break
					case ELogTagType.CompactPointer: {
						version.compactPointers.set(
							reader.readVarLong(),
							reader.readLengthPrefixedBytes()
						)
						break
					}
					case ELogTagType.DeletedFile: {
						const level = reader.readVarLong()
						const fileNumber = reader.readVarLong()

						if (!version.deletedFiles.has(level))
							version.deletedFiles.set(level, new Set<number>())

						version.deletedFiles.get(level)!.add(fileNumber)
						break
					}
					case ELogTagType.NewFile: {
						const level = reader.readVarLong()
						const fileNumber = reader.readVarLong()
						const fileSize = reader.readVarLong()
						const smallestKey = reader.readLengthPrefixedBytes()
						const largestKey = reader.readLengthPrefixedBytes()

						const fileMetaData = new FileMetaData({
							fileNumber,
							fileSize,
							smallestKey,
							largestKey,
						})

						if (!version.levels.has(level))
							version.levels.set(level, [])

						version.levels.get(level)!.push(fileMetaData)
						break
					}
					case ELogTagType.PrevLogNumber:
						version.previousLogNumber = reader.readVarLong()
						break
					default:
						throw new Error('Unknown log tag: ' + logTag)
				}
			}
		}

		// Cleanup deleted files
		const deletedFiles = new Set<number>()
		for (const deletedFile of version.deletedFiles.values()) {
			for (const fileNumber of deletedFile) {
				deletedFiles.add(fileNumber)
			}
		}

		for (const [levelKey, fileMetaData] of version.levels.entries()) {
			version.levels.set(
				levelKey,
				fileMetaData.filter(
					(fileMetaData) => !deletedFiles.has(fileMetaData.fileNumber)
				)
			)
		}

		if (!version.comparator) version.comparator = defaultLdbOperator

		return version
	}

	protected async createTable(fileNumber: number) {
		const fileName = `${fileNumber.toString().padStart(6, '0')}.ldb`

		let fileHandle: AnyFileHandle
		try {
			fileHandle = await this.dbDirectory.getFileHandle(fileName)
		} catch {
			throw new Error(`File ${fileName} not found`)
		}

		const table = new Table(fileHandle)
		await table.load()

		return table
	}
}
