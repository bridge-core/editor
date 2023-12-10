import { join } from '@/libs/path'
import DashWorker from './DashWorker?worker'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { WorkerFileSystemEntryPoint } from '../fileSystem/WorkerFileSystem'
import { fileSystem } from '@/App'

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

	constructor(public project: BedrockProject) {}

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
