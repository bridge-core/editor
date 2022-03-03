import { FileMetaData } from './FileMetaData'

export class Version {
	public comparator?: string
	public logNumber?: number
	public previousLogNumber?: number
	public nextFileNumber?: number
	public lastSequence?: number

	public deletedFiles = new Map<number, Set<number>>()
	public levels = new Map<number, Set<FileMetaData>>()
	public compactPointers = new Map<number, Uint8Array>()

	getFiles(level: number): FileMetaData[] {
		return [...(this.levels.get(level) ?? [])]
	}
	addFile(level: number, file: FileMetaData) {
		if (!this.levels.has(level)) {
			this.levels.set(level, new Set())
		}

		this.levels.get(level)!.add(file)
	}
	removeFile(level: number, fileNumber: number) {
		const files = this.getFiles(level)

		const index = files.findIndex((f) => f.fileNumber === fileNumber)
		if (index === -1) {
			throw new Error(`File ${fileNumber} not found in level ${level}`)
		}

		this.levels.get(level)!.delete(files[index])

		if (!this.deletedFiles.has(level)) {
			this.deletedFiles.set(level, new Set())
		}
		this.deletedFiles.get(level)!.add(fileNumber)
	}

	getCompactPointer(level: number) {
		return this.compactPointers.get(level) ?? null
	}
	setCompactPointer(level: number, pointer: Uint8Array) {
		this.compactPointers.set(level, pointer)
	}
	removeCompactPointer(level: number) {
		this.compactPointers.delete(level)
	}
}
