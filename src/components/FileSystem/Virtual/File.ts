import { BaseStore } from './Stores/BaseStore'

const textDecoder = new TextDecoder()

export class VirtualFile implements File {
	public readonly type: string
	public readonly lastModified: number
	public readonly size: number
	protected _cachedBuffer: ArrayBuffer | null = null

	constructor(
		protected baseStore: BaseStore,
		protected readonly path: string,
		[size, lastModified, type]: readonly [number, number, string]
	) {
		this.type = type
		this.size = size
		this.lastModified = lastModified
	}

	static async for(baseStore: BaseStore, path: string): Promise<File> {
		return new VirtualFile(baseStore, path, await baseStore.metadata(path))
	}
	get webkitRelativePath(): string {
		throw new Error('Method not implemented')
	}
	slice(): Blob {
		throw new Error('Method not implemented')
	}

	get name() {
		return this.path.split('/').pop()!
	}

	async arrayBuffer() {
		if (this._cachedBuffer) return this._cachedBuffer

		this._cachedBuffer = typedArrayToBuffer(
			await this.baseStore.read(this.path)
		)

		return this._cachedBuffer
	}

	async text() {
		return textDecoder.decode(await this.arrayBuffer())
	}

	stream() {
		return new ReadableStream({
			start: (controller) => {
				this.arrayBuffer().then((arrayBuffer) => {
					controller.enqueue(new Uint8Array(arrayBuffer))
					controller.close()
				})
			},
		})
	}

	async toBlob() {
		return new Blob([await this.arrayBuffer()], { type: this.type })
	}
}

function typedArrayToBuffer(array: Uint8Array): ArrayBuffer {
	return array.buffer.slice(
		array.byteOffset,
		array.byteLength + array.byteOffset
	)
}
