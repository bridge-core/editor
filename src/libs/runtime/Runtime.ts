import { fileSystem } from '@/App'
import { Runtime as BridgeRuntime } from 'bridge-js-runtime'
import { basename } from '@/libs/path'

export class Runtime extends BridgeRuntime {
	async readFile(filePath: string): Promise<File> {
		const file = await fileSystem.readFile(filePath)

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
