import { BaseStore } from './Stores/BaseStore'

const textDecoder = new TextDecoder()

export class VirtualFile {
	constructor(
		protected baseStore: BaseStore,
		protected readonly path: string,
		public readonly lastModified: number
	) {}

	static async for(baseStore: BaseStore, path: string): Promise<File> {
		const lastModified = await baseStore.lastModified(path)

		return new VirtualFile(baseStore, path, lastModified)
	}

	get size(): number {
		throw new Error('Not implemented')
	}
	get type(): string {
		throw new Error('Not implemented')
	}
	get webkitRelativePath(): string {
		throw new Error('Not implemented')
	}
	slice(): VirtualFile {
		throw new Error('Not implemented')
	}

	get name() {
		return this.path.split('/').pop()!
	}

	async arrayBuffer() {
		return typedArrayToBuffer(await this.baseStore.read(this.path))
	}

	async text() {
		return textDecoder.decode(await this.arrayBuffer())
	}

	stream() {
		return new ReadableStream({
			start: async (controller) => {
				const arrayBuffer = await this.arrayBuffer()

				controller.enqueue(arrayBuffer)
				controller.close()
			},
		})
	}
}

function typedArrayToBuffer(array: Uint8Array): ArrayBuffer {
	return array.buffer.slice(
		array.byteOffset,
		array.byteLength + array.byteOffset
	)
}
