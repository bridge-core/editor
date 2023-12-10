import { BaseFileSystem } from './BaseFileSystem'
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
				path: path,
				id: messageId,
				fileSystemName: this.name,
			})
		})

		removeEventListener('message', functionToUnbind!)

		return data
	}
}
