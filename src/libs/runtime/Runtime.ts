import { Runtime as BridgeRuntime, initRuntimes } from 'bridge-js-runtime'
import { basename } from 'pathe'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import wasmUrl from '@swc/wasm-web/wasm-web_bg.wasm?url'

export class Runtime extends BridgeRuntime {
	constructor(public fileSystem: BaseFileSystem) {
		initRuntimes(wasmUrl)

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
