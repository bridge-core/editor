import { join } from '@/libs/path'
import DashWorker from './DashWorker?worker'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { WorkerFileSystemEntryPoint } from '@/libs/fileSystem/WorkerFileSystem'
import { Sidebar } from '@/components/Sidebar/Sidebar'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { sendAndWait } from '@/libs/worker/Communication'
import { Notification } from '@/components/Sidebar/Sidebar'
import { v4 as uuid } from 'uuid'
import { Data } from '@/libs/data/Data'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { Disposable, AsyncDisposable, disposeAll } from '@/libs/disposeable/Disposeable'

export class DashService implements AsyncDisposable {
	public logs: string[] = []
	public isSetup: boolean = false

	private worker = new DashWorker()
	private inputFileSystem = new WorkerFileSystemEntryPoint(this.worker, fileSystem, 'inputFileSystem')
	private outputFileSystem: WorkerFileSystemEntryPoint
	private progressNotification: Notification | null = null
	private inFlightBuildRequest: boolean = false
	private building: boolean = false
	private watchRebuildRequestId: string | null = null
	private disposables: Disposable[] = []

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
				data: await Data.get(event.data.path),
			})
		}

		if (event.data.action === 'log') {
			this.logs.push(event.data.message)
		}

		if (event.data.action === 'progress') {
			if (this.progressNotification === null) return

			Sidebar.setProgress(this.progressNotification, event.data.progress)
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

		this.disposables.push(fileSystem.pathUpdated.on(this.pathUpdated.bind(this)))
	}

	public async dispose() {
		this.worker.terminate()

		this.inputFileSystem.dispose()
		this.outputFileSystem.dispose()

		disposeAll(this.disposables)
	}

	public setOutputFileSystem(fileSystem: BaseFileSystem) {
		this.outputFileSystem.dispose()

		this.outputFileSystem = new WorkerFileSystemEntryPoint(this.worker, fileSystem, 'outputFileSystem')
	}

	public async build() {
		if (this.building) {
			this.inFlightBuildRequest = true

			return
		}

		this.building = true

		this.progressNotification = Sidebar.addProgressNotification('manufacturing', 0, 1, undefined, undefined)

		await sendAndWait(
			{
				action: 'build',
			},
			this.worker
		)

		Sidebar.clearNotification(this.progressNotification)

		this.building = false

		if (this.inFlightBuildRequest) {
			this.inFlightBuildRequest = false

			this.build()
		}
	}

	private pathUpdated(path: unknown) {
		if (typeof path !== 'string') return

		if (!path.startsWith(this.project.path)) return

		if (path.startsWith(join(this.project.path, '.bridge/'))) return

		const requestId = uuid()

		this.watchRebuildRequestId = requestId

		setTimeout(() => {
			if (this.watchRebuildRequestId !== requestId) return

			this.build()
		}, 10)
	}
}
