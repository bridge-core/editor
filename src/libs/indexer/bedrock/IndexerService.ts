import { WorkerFileSystemEntryPoint } from '@/libs/fileSystem/WorkerFileSystem'
import IndexerWorker from './IndexerWorker?worker'
import { data, fileSystem } from '@/App'
import { sendAndWait } from '@/libs/worker/Communication'
import { BedrockProject } from '@/libs/project/BedrockProject'

export class IndexerService {
	private index: { [key: string]: { fileType: string; data?: any } } = {}
	private instructions: { [key: string]: any } = {}
	private worker = new IndexerWorker()
	private workerFileSystem = new WorkerFileSystemEntryPoint(
		this.worker,
		fileSystem
	)

	constructor(public project: BedrockProject) {
		this.worker.onmessage = this.onWorkerMessage.bind(this)
	}

	public async onWorkerMessage(event: MessageEvent) {
		if (!event.data) return

		if (event.data.action === 'getFileType') {
			this.worker.postMessage({
				id: event.data.id,
				fileType: await this.project.fileTypeData.get(event.data.path),
			})
		}
	}

	public async setup() {
		this.instructions = await data.get(
			'packages/minecraftBedrock/lightningCaches.json'
		)

		this.index = (
			await sendAndWait(
				{
					action: 'setup',
					path: this.project.path,
					instructions: this.instructions,
				},
				this.worker
			)
		).index
	}

	public async getCachedData(
		fileType: string,
		filePath?: string,
		cacheKey?: string
	): Promise<null | any> {
		let data: string[] = []

		if (filePath !== undefined) {
			if (this.index[filePath] === undefined) return null

			if (this.index[filePath].fileType !== fileType) return null

			return cacheKey
				? this.index[filePath].data[cacheKey]
				: this.index[filePath].data
		} else {
			data = Object.values(this.index)
				.filter((indexedData) => {
					return indexedData.fileType === fileType && indexedData.data
				})
				.map((indexedData) => {
					return cacheKey ? indexedData.data[cacheKey] : indexedData
				})
				.flat()
		}

		return data.length === 0 ? null : data
	}

	public getIndexedFiles() {
		return Object.keys(this.index)
	}

	public async disposte() {
		this.worker.terminate()

		this.workerFileSystem.dispose()
	}
}
