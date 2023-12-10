import { join } from '@/libs/path'
import DashWorker from './DashWorker?worker'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { WorkerFileSystemEntryPoint } from '../fileSystem/WorkerFileSystem'
import { data, fileSystem } from '@/App'

export class DashService {
	private worker = new DashWorker()
	private inputFileSystem = new WorkerFileSystemEntryPoint(
		this.worker,
		fileSystem,
		'inputFileSystem'
	)
	private outputFileSystem = new WorkerFileSystemEntryPoint(
		this.worker,
		fileSystem,
		'outputFileSystem'
	)

	constructor(public project: BedrockProject) {
		this.worker.onmessage = this.onWorkerMessage.bind(this)
	}

	public async onWorkerMessage(event: MessageEvent) {
		if (!event.data) return

		if (event.data.action === 'getJsonData') {
			this.worker.postMessage({
				id: event.data.id,
				data: JSON.stringify(await data.get(event.data.path)),
			})
		}
	}

	public async load() {
		this.worker.postMessage({
			action: 'setup',
			config: JSON.stringify(this.project.config),
			configPath: join(this.project.path, 'config.json'),
		})
	}

	public async dispose() {
		this.inputFileSystem.dispose()
		this.outputFileSystem.dispose()
		this.worker.terminate()
	}
}
