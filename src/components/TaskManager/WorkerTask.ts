import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'

class LegacyProgress<T, K> {
	constructor(
		protected taskService: TaskService<T, K>,
		protected current: number,
		protected total: number,
		protected prevTotal: number
	) {}

	addToCurrent(value?: number) {
		this.current += value ?? 1
		this.taskService.dispatch([this.getCurrent(), this.getTotal()])
	}
	addToTotal(value?: number) {
		this.total += value ?? 1
		this.taskService.dispatch([this.getCurrent(), this.getTotal()])
	}

	getTotal() {
		return this.total > this.prevTotal ? this.total : this.prevTotal
	}
	getCurrent() {
		return this.current
	}

	setTotal(val: number) {
		this.total = val
	}
}

export abstract class TaskService<T, K = void> extends EventDispatcher<
	[number, number]
> {
	protected lastDispatch = 0
	public fileSystem: FileSystem
	public progress!: LegacyProgress<T, K>
	constructor(
		protected taskId: string,
		baseDirectory: FileSystemDirectoryHandle
	) {
		super()
		this.fileSystem = new FileSystem(baseDirectory)
	}

	protected async loadPreviousTaskRun() {
		try {
			const file = await this.fileSystem.readFile(
				`.bridge/tasks/${this.taskId}.txt`
			)
			const prevTotal = Number(await file.text())
			return Number.isNaN(prevTotal) ? 100 : prevTotal
		} catch {
			return 100
		}
	}
	protected async saveCurrentTaskRun() {
		await this.fileSystem.writeFile(
			`.bridge/tasks/${this.taskId}.txt`,
			`${this.progress.getCurrent()}`
		)
	}

	protected abstract onStart(data: K): Promise<T> | T

	async start(data: K) {
		this.progress = new LegacyProgress(
			this,
			0,
			0,
			await this.loadPreviousTaskRun()
		)

		const result = await this.onStart(data)

		this.saveCurrentTaskRun()
		this.dispatch([this.progress.getCurrent(), this.progress.getCurrent()])

		return result
	}

	dispatch(data: [number, number]) {
		// Otherwise, first check that we don't send too many messages to the main thread
		if (this.lastDispatch + 200 > Date.now()) return

		super.dispatch(data)
		this.lastDispatch = Date.now()
	}
}
