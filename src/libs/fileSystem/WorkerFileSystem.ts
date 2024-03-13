import { sendAndWait } from '@/libs/worker/Communication'
import { BaseEntry, BaseFileSystem } from './BaseFileSystem'

export class WorkerFileSystemEntryPoint {
	public boundOnWorkerMessage: (event: MessageEvent) => void

	constructor(public worker: Worker, private fileSystem: BaseFileSystem, private name: string = 'fileSystem') {
		this.boundOnWorkerMessage = this.onWorkerMessage.bind(this)

		worker.addEventListener('message', this.boundOnWorkerMessage)
	}

	private async onWorkerMessage(event: MessageEvent) {
		if (!event.data) return
		if (event.data.fileSystemName !== this.name) return

		if (event.data.action === 'readFile') {
			const data = await this.fileSystem.readFile(event.data.path)

			this.worker.postMessage(
				{
					arrayBuffer: data,
					id: event.data.id,
					fileSystemName: this.name,
				},
				[data]
			)
		}

		if (event.data.action === 'writeFile') {
			await this.fileSystem.writeFile(event.data.path, event.data.content)

			this.worker.postMessage({
				id: event.data.id,
				fileSystemName: this.name,
			})
		}

		if (event.data.action === 'readDirectoryEntries') {
			this.worker.postMessage({
				entries: await this.fileSystem.readDirectoryEntries(event.data.path),
				id: event.data.id,
				fileSystemName: this.name,
			})
		}

		if (event.data.action === 'makeDirectory') {
			await this.fileSystem.makeDirectory(event.data.path)

			this.worker.postMessage({
				id: event.data.id,
				fileSystemName: this.name,
			})
		}

		if (event.data.action === 'exists') {
			this.worker.postMessage({
				exists: await this.fileSystem.exists(event.data.path),
				id: event.data.id,
				fileSystemName: this.name,
			})
		}
	}

	public dispose() {
		this.worker.removeEventListener('message', this.boundOnWorkerMessage)
	}
}

export class WorkerFileSystemEndPoint extends BaseFileSystem {
	constructor(private name: string = 'fileSystem') {
		super()
	}

	public async readFile(path: string): Promise<ArrayBuffer> {
		return (
			await sendAndWait({
				action: 'readFile',
				path,
				fileSystemName: this.name,
			})
		).arrayBuffer
	}

	public async writeFile(path: string, content: string) {
		// console.log('Worker write file', path)

		await sendAndWait({
			action: 'writeFile',
			path,
			content,
			fileSystemName: this.name,
		})
	}

	public async readDirectoryEntries(path: string): Promise<BaseEntry[]> {
		// console.log('Worker read directory entries', path)

		return (
			await sendAndWait({
				action: 'readDirectoryEntries',
				path,
				fileSystemName: this.name,
			})
		).entries
	}

	public async makeDirectory(path: string) {
		// console.log('Worker make directory', path)

		await sendAndWait({
			action: 'makeDirectory',
			path,
			fileSystemName: this.name,
		})
	}

	public async exists(path: string): Promise<boolean> {
		// console.log('Worker exists', path)

		return (
			await sendAndWait({
				action: 'exists',
				path,
				fileSystemName: this.name,
			})
		).exists
	}
}
