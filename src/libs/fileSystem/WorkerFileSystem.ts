import { BaseEntry, BaseFileSystem } from './BaseFileSystem'
import { v4 as uuid } from 'uuid'

export class WorkerFileSystemEntryPoint {
	public boundOnWorkerMessage: (event: MessageEvent) => void

	constructor(
		public worker: Worker,
		private fileSystem: BaseFileSystem,
		private name: string = 'fileSystem'
	) {
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
				entries: JSON.stringify(
					await this.fileSystem.readDirectoryEntries(event.data.path)
				),
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
		// console.log('Worker read file', path)

		let functionToUnbind: EventListener | null = null

		const name = this.name

		const data: ArrayBuffer = await new Promise((resolve, reject) => {
			let messageId = uuid()

			function recieveMessage(event: MessageEvent) {
				if (!event.data) return
				if (event.data.id !== messageId) return
				if (event.data.fileSystemName !== name) return

				resolve(event.data.arrayBuffer)
			}

			let functionToUnbind = recieveMessage

			addEventListener('message', functionToUnbind)

			postMessage({
				action: 'readFile',
				path,
				id: messageId,
				fileSystemName: this.name,
			})
		})

		removeEventListener('message', functionToUnbind!)

		return data
	}

	public async writeFile(path: string, content: string) {
		// console.log('Worker write file', path)

		let functionToUnbind: EventListener | null = null

		const name = this.name

		await new Promise<void>((resolve, reject) => {
			let messageId = uuid()

			function recieveMessage(event: MessageEvent) {
				if (!event.data) return
				if (event.data.id !== messageId) return
				if (event.data.fileSystemName !== name) return

				resolve()
			}

			let functionToUnbind = recieveMessage

			addEventListener('message', functionToUnbind)

			postMessage({
				action: 'writeFile',
				path,
				content,
				id: messageId,
				fileSystemName: this.name,
			})
		})

		removeEventListener('message', functionToUnbind!)
	}

	public async readDirectoryEntries(path: string): Promise<BaseEntry[]> {
		// console.log('Worker read directory entries', path)

		let functionToUnbind: EventListener | null = null

		const name = this.name

		const data: BaseEntry[] = await new Promise((resolve, reject) => {
			let messageId = uuid()

			function recieveMessage(event: MessageEvent) {
				if (!event.data) return
				if (event.data.id !== messageId) return
				if (event.data.fileSystemName !== name) return

				resolve(JSON.parse(event.data.entries))
			}

			let functionToUnbind = recieveMessage

			addEventListener('message', functionToUnbind)

			postMessage({
				action: 'readDirectoryEntries',
				path,
				id: messageId,
				fileSystemName: this.name,
			})
		})

		removeEventListener('message', functionToUnbind!)

		return data
	}

	public async makeDirectory(path: string) {
		// console.log('Worker make directory', path)

		let functionToUnbind: EventListener | null = null

		const name = this.name

		await new Promise<void>((resolve, reject) => {
			let messageId = uuid()

			function recieveMessage(event: MessageEvent) {
				if (!event.data) return
				if (event.data.id !== messageId) return
				if (event.data.fileSystemName !== name) return

				resolve()
			}

			let functionToUnbind = recieveMessage

			addEventListener('message', functionToUnbind)

			postMessage({
				action: 'makeDirectory',
				path,
				id: messageId,
				fileSystemName: this.name,
			})
		})

		removeEventListener('message', functionToUnbind!)
	}

	public async exists(path: string): Promise<boolean> {
		// console.log('Worker exists', path)

		let functionToUnbind: EventListener | null = null

		const name = this.name

		const exists: boolean = await new Promise((resolve, reject) => {
			let messageId = uuid()

			function recieveMessage(event: MessageEvent) {
				if (!event.data) return
				if (event.data.id !== messageId) return
				if (event.data.fileSystemName !== name) return

				resolve(event.data.exists)
			}

			let functionToUnbind = recieveMessage

			addEventListener('message', functionToUnbind)

			postMessage({
				action: 'exists',
				path,
				id: messageId,
				fileSystemName: this.name,
			})
		})

		removeEventListener('message', functionToUnbind!)

		return exists
	}
}
