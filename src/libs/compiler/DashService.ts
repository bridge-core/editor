import { basename, join } from 'pathe'
import DashWorker from './DashWorker?worker'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { WorkerFileSystemEntryPoint } from '@/libs/fileSystem/WorkerFileSystem'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { sendAndWait } from '@/libs/worker/Communication'
import { v4 as uuid } from 'uuid'
import { Data } from '@/libs/data/Data'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { Disposable, AsyncDisposable, disposeAll } from '@/libs/disposeable/Disposeable'
import { NotificationSystem, Notification } from '@/components/Notifications/NotificationSystem'
import { ActionManager } from '@/libs/actions/ActionManager'
import { Action } from '@/libs/actions/Action'

export class DashService implements AsyncDisposable {
	public logs: string[] = []
	public isSetup: boolean = false
	public profiles: Action[] = []

	private worker = new DashWorker()
	private inputFileSystem = new WorkerFileSystemEntryPoint(this.worker, fileSystem, 'inputFileSystem')
	private outputFileSystem: WorkerFileSystemEntryPoint
	private progressNotification: Notification | null = null
	private inFlightBuildRequest: boolean = false
	private building: boolean = false
	private watchRebuildRequestId: string | null = null
	private lastProfile: string | null = null
	private mode: 'development' | 'production' = 'development'
	private disposables: Disposable[] = []

	constructor(public project: BedrockProject, fileSystem?: BaseFileSystem) {
		this.worker.onmessage = this.onWorkerMessage.bind(this)

		this.outputFileSystem = new WorkerFileSystemEntryPoint(this.worker, fileSystem ?? project.outputFileSystem, 'outputFileSystem')
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

			NotificationSystem.setProgress(this.progressNotification, event.data.progress)
		}
	}

	public async setup(mode: 'development' | 'production', compilerConfigPath?: string) {
		this.mode = mode

		await sendAndWait(
			{
				action: 'setup',
				config: this.project.config,
				mode,
				configPath: join(this.project.path, 'config.json'),
				compilerConfigPath,
			},
			this.worker
		)

		this.isSetup = true
	}

	public async setupForDevelopmentProject() {
		await this.setupCompileActions()

		await this.setup('development')

		this.disposables.push(fileSystem.pathUpdated.on(this.pathUpdated.bind(this)))
	}

	public async dispose() {
		this.worker.terminate()

		this.inputFileSystem.dispose()
		this.outputFileSystem.dispose()

		this.removeCompileActions()

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

		this.progressNotification = NotificationSystem.addProgressNotification('manufacturing', 0, 1, undefined, undefined)

		await sendAndWait(
			{
				action: 'build',
			},
			this.worker
		)

		NotificationSystem.clearNotification(this.progressNotification)

		this.building = false

		if (this.inFlightBuildRequest) {
			this.inFlightBuildRequest = false

			this.build()
		}
	}

	public async compileFiles(paths: string[]) {
		this.progressNotification = NotificationSystem.addProgressNotification('manufacturing', 0, 1, undefined, undefined)

		await sendAndWait(
			{
				action: 'compileFiles',
				paths,
			},
			this.worker
		)

		NotificationSystem.clearNotification(this.progressNotification)
	}

	private async setupCompileActions() {
		this.profiles.push(
			ActionManager.addAction(
				new Action({
					id: 'dash.compileDefault',
					trigger: async () => {
						if (this.lastProfile !== null) await this.setup(this.mode)

						this.lastProfile = null

						this.build()
					},
					keyBinding: 'Ctrl + B',
					name: 'actions.dash.compileDefault.name',
					description: 'actions.dash.compileDefault.description',
					icon: 'manufacturing',
					category: 'actions.dash',
				})
			)
		)

		if (!(await fileSystem.exists(join(this.project.path, '.bridge/compiler')))) return

		const profileEntries = await fileSystem.readDirectoryEntries(join(this.project.path, '.bridge/compiler'))

		for (const entry of profileEntries) {
			let profile: null | any = null

			try {
				profile = await fileSystem.readFileJson(entry.path)
			} catch {}

			if (profile === null) continue

			if (!profile.name) continue

			this.profiles.push(
				ActionManager.addAction(
					new Action({
						id: 'dash.compileProfile-' + basename(entry.path),
						trigger: async () => {
							if (this.lastProfile !== entry.path) await this.setup(this.mode, entry.path)

							this.lastProfile = entry.path

							this.build()
						},
						name: profile.name,
						description: profile.description ?? undefined,
						icon: profile.icon ?? 'manufacturing',
						category: 'actions.dash',
					})
				)
			)
		}
	}

	private removeCompileActions() {
		for (const profile of this.profiles) {
			ActionManager.removeAction(profile)
		}
	}

	private pathUpdated(path: unknown) {
		if (typeof path !== 'string') return

		if (!path.startsWith(this.project.path)) return

		if (path.startsWith(join(this.project.path, '.bridge'))) return
		if (path.startsWith(join(this.project.path, '.git'))) return

		const requestId = uuid()

		this.watchRebuildRequestId = requestId

		setTimeout(() => {
			if (this.watchRebuildRequestId !== requestId) return

			this.build()
		}, 10)
	}
}
