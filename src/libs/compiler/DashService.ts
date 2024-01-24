import { join } from '@/libs/path'
import DashWorker from './DashWorker?worker'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { WorkerFileSystemEntryPoint } from '@/libs/fileSystem/WorkerFileSystem'
import { data, fileSystem, sidebar } from '@/App'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { sendAndWait } from '@/libs/worker/Communication'
import { Notification } from '@/components/Sidebar/Sidebar'

export class DashService {
	public logs: string[] = []
	public isSetup: boolean = false

	private worker = new DashWorker()
	private inputFileSystem = new WorkerFileSystemEntryPoint(this.worker, fileSystem, 'inputFileSystem')
	private outputFileSystem: WorkerFileSystemEntryPoint
	private progressNotification: Notification | null = null

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

		if (event.data.action === 'progress') {
			if (this.progressNotification === null) return

			sidebar.setProgress(this.progressNotification, event.data.progress)
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

		this.isSetup = true

		fileSystem.eventSystem.on('pathUpdated', this.pathUpdated.bind(this))
	}

	public async dispose() {
		this.worker.terminate()

		this.inputFileSystem.dispose()
		this.outputFileSystem.dispose()

		fileSystem.eventSystem.off('pathUpdated', this.pathUpdated.bind(this))
	}

	public setOutputFileSystem(fileSystem: BaseFileSystem) {
		this.outputFileSystem.dispose()

		this.outputFileSystem = new WorkerFileSystemEntryPoint(this.worker, fileSystem, 'outputFileSystem')
	}

	public async build() {
		this.progressNotification = sidebar.addProgressNotification('manufacturing', 0, 1, undefined, undefined)

		await sendAndWait(
			{
				action: 'build',
			},
			this.worker
		)

		sidebar.clearNotification(this.progressNotification)
	}

	private async pathUpdated(path: unknown) {
		if (typeof path !== 'string') return

		if (!path.startsWith(this.project.path) && !path.startsWith('/' + this.project.path)) return

		if (path === join(this.project.path, '.bridge/.dash.development.json')) return

		await this.build()
	}
}
