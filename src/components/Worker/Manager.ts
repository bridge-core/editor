import { App } from '@/App'
import { Signal } from '@/components/Common/Event/Signal'
import { Remote, wrap } from 'comlink'
import { ITaskDetails, Task } from '../TaskManager/Task'

export abstract class WorkerManager<T, O, A, R> extends Signal<R> {
	protected worker: Worker | null = null
	protected workerClass: Remote<{ new (options: O): T }> | null = null
	protected _service: Remote<T> | null = null
	protected task: Task | null = null

	constructor(protected taskOptions: ITaskDetails) {
		super()
	}

	abstract createWorker(): void

	async activate(arg: A) {
		if (!this.worker) {
			this.createWorker()
			if (!this.worker)
				throw new Error(
					`Method WorkerManager.createWorker() doesn't create worker`
				)

			this.workerClass = wrap<{ new (): T }>(this.worker)
		}

		const app = await App.getApp()

		this.task = app.taskManager.create(this.taskOptions)
		this.resetSignal()
		await this.start(arg).then(returnData => this.dispatch(returnData))
	}

	deactivate() {
		this.worker?.terminate()
		this.task?.dispose()
		this.worker = null
		this.workerClass = null
	}

	protected abstract start(arg: A): Promise<R>
}
