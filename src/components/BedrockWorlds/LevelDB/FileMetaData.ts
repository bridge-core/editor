import { Table } from './Table/Table'

export interface IFileMetaData {
	fileNumber: number
	fileSize: number
	smallestKey: Uint8Array
	largestKey: Uint8Array
}
export class FileMetaData {
	public fileNumber: number
	public fileSize: number
	public smallestKey: Uint8Array
	public largestKey: Uint8Array
	public table?: Table

	constructor({
		fileNumber,
		fileSize,
		smallestKey,
		largestKey,
	}: IFileMetaData) {
		this.fileNumber = fileNumber
		this.fileSize = fileSize
		this.smallestKey = smallestKey
		this.largestKey = largestKey
	}
}
