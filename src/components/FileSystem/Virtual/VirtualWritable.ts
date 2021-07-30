import { VirtualFileHandle } from './FileHandle'

const textEncoder = new TextEncoder()
export const writeMethodSymbol = Symbol('writeMethod')

export class VirtualWritable {
	protected tmpData = new Uint8Array()
	protected cursorOffset = 0
	locked = false

	constructor(protected fileHandle: VirtualFileHandle) {}

	async write(data: FileSystemWriteChunkType): Promise<void> {
		let rawData: Uint8Array
		if (typeof data === 'string') rawData = textEncoder.encode(data)
		else if (data instanceof Blob)
			rawData = await data
				.arrayBuffer()
				.then((buffer) => new Uint8Array(buffer))
		else if ('type' in data) {
			if (data.type === 'seek') return await this.seek(data.position)
			else if (data.type === 'truncate')
				return await this.truncate(data.size)
			else if (data.type === 'write') {
				if (data.position) await this.seek(data.position)

				return await this.write(data.data)
			} else {
				// @ts-expect-error
				throw new Error(`Unknown data type: ${data.type}`)
			}
		} else if (!ArrayBuffer.isView(data)) rawData = new Uint8Array(data)
		else rawData = new Uint8Array(data.buffer)

		this.tmpData = new Uint8Array([
			...this.tmpData.slice(0, this.cursorOffset),
			...rawData,
		])
		this.cursorOffset = this.tmpData.length
	}

	async seek(offset: number) {
		this.cursorOffset = Math.floor(offset)
	}
	async truncate(size: number) {
		this.tmpData = this.tmpData.slice(0, size)

		if (this.cursorOffset > size) {
			this.cursorOffset = size
		}
	}

	async close() {
		this.fileHandle[writeMethodSymbol](this.tmpData)
	}
	async abort() {
		throw new Error(`WriteStream was aborted`)
	}
	getWriter(): any {}
}
