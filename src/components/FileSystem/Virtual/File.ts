import { BaseStore } from './Stores/BaseStore'

const textDecoder = new TextDecoder()

export class VirtualFile {
	public readonly isVirtual = true
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

	static async for(baseStore: BaseStore, path: string): Promise<VirtualFile> {
		return new VirtualFile(baseStore, path, await baseStore.metadata(path))
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

	async toBlobFile() {
		return new File([await this.arrayBuffer()], this.name, {
			type: this.type,
		})
	}
}

function typedArrayToBuffer(array: Uint8Array): ArrayBuffer {
	return array.buffer.slice(
		array.byteOffset,
		array.byteLength + array.byteOffset
	)
}

declare global {
	interface File {
		isVirtual: false
	}
}

File.prototype.isVirtual = false
