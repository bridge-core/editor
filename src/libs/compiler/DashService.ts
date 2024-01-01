import { join } from '@/libs/path'
import DashWorker from './DashWorker?worker'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { WorkerFileSystemEntryPoint } from '../fileSystem/WorkerFileSystem'
import { data, fileSystem, sidebar } from '@/App'
import { BaseFileSystem } from '../fileSystem/BaseFileSystem'
import { sendAndWait } from '../worker/Communication'

export class DashService {
	public logs: string[] = []

	private worker = new DashWorker()
	private inputFileSystem = new WorkerFileSystemEntryPoint(
		this.worker,
		fileSystem,
		'inputFileSystem'
	)
	private outputFileSystem: WorkerFileSystemEntryPoint

	constructor(public project: BedrockProject) {
		this.worker.onmessage = this.onWorkerMessage.bind(this)

		this.outputFileSystem = new WorkerFileSystemEntryPoint(
			this.worker,
			project.outputFileSystem,
			'outputFileSystem'
		)
	}

	public async onWorkerMessage(event: MessageEvent) {
		if (!event.data) return

		if (event.data.action === 'getJsonData') {
			this.worker.postMessage({
				id: event.data.id,
				data: await data.get(event.data.path),
			})
		}

		if (event.data.action === 'log') {
			this.logs.push(event.data.message)
		}
	}

	public async setup() {
		await sendAndWait(
			{
				action: 'setup',
				config: this.project.config,
				configPath: join(this.project.path, 'config.json'),
			},
			this.worker
		)
	}

	public async dispose() {
		this.worker.terminate()

		this.inputFileSystem.dispose()
		this.outputFileSystem.dispose()
	}

	public setOutputFileSystem(fileSystem: BaseFileSystem) {
		this.outputFileSystem.dispose()

		this.outputFileSystem = new WorkerFileSystemEntryPoint(
			this.worker,
			fileSystem,
			'outputFileSystem'
		)
	}

	public async build() {
		const notification = sidebar.addNotification(
			'manufacturing',
			undefined,
			undefined,
			'progress'
		)

		await sendAndWait(
			{
				action: 'build',
			},
			this.worker
		)

		sidebar.clearNotification(notification)
	}
}
