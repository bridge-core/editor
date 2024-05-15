import { Runtime as BridgeRuntime } from 'bridge-js-runtime'
import { basename } from 'pathe'
import { BaseFileSystem } from '../fileSystem/BaseFileSystem'

export class Runtime extends BridgeRuntime {
	constructor(public fileSystem: BaseFileSystem) {
		super()
	}

	async readFile(filePath: string): Promise<File> {
		const file = await this.fileSystem.readFile(filePath)

		return {
			name: basename(filePath),
			type: 'unkown',
			size: file.byteLength,
			lastModified: Date.now(),
			webkitRelativePath: filePath,

			arrayBuffer: () => Promise.resolve(file),
			slice: () => new Blob(),
			stream: () => new ReadableStream(),
			text: () => Promise.resolve(''),
		}
	}
}
