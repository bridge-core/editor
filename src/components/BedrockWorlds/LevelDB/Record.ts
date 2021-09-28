export enum ELogRecordType {
	// Zero is reserved for preallocated files
	Zero = 0,

	Full = 1,

	// For fragments
	First = 2,
	Middle = 3,
	Last = 4,

	// Util
	Eof = Last + 1,
	BadRecord = Last + 2,
	Undefined = Last + 2,
}

interface IRecord {
	type: ELogRecordType
	data?: Uint8Array
	length?: number
	checksum?: number
}
export class Record {
	public type: ELogRecordType
	public checksum?: number
	public length?: number
	public data?: Uint8Array

	constructor({ type, checksum, data, length }: IRecord) {
		this.type = type
		this.checksum = checksum
		this.data = data
		this.length = length
	}
}

export class UndefinedRecord extends Record {
	constructor() {
		super({ type: ELogRecordType.Undefined })
	}
}
