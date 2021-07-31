import { App } from '/@/App'
import { Signal } from '/@/components/Common/Event/Signal'
import { Remote, wrap } from 'comlink'
import { ITaskDetails, Task } from '../TaskManager/Task'

const workerKillTime = 2 * 60 * 1000 // 2 minutes

export abstract class WorkerManager<
	RemoteClass,
	RemoteClassInstance,
	StartArg,
	SignalData
> extends Signal<SignalData> {
	protected worker: Worker | null = null
	protected workerClass: Remote<RemoteClass> | null = null
	protected _service: Remote<RemoteClassInstance> | null = null
	protected task: Task | null = null
	protected disposeTimeout?: number

	get service() {
		if (!this._service)
			throw new Error(`Accessing service without service being defined`)
		return this._service
	}

	constructor(protected taskOptions: ITaskDetails, protected app?: App) {
		super()
	}

	async activate(arg: StartArg) {
		if (this.disposeTimeout !== undefined) {
			window.clearTimeout(this.disposeTimeout)
			this.disposeTimeout = undefined
			return
		}

		const app = this.app ?? (await App.getApp())
		this.task = app.taskManager.create(this.taskOptions)

		if (!this.worker) {
			this.createWorker()

			if (!this.worker)
				throw new Error(
					`Method WorkerManager.createWorker() doesn't create worker`
				)
			this.workerClass = wrap<RemoteClass>(this.worker)
		}

		this.resetSignal()
		await this.start(arg).then((returnData) => {
			this.task?.complete()
			this.dispatch(returnData)
		})
	}

	deactivate() {
		this.disposeTimeout = window.setTimeout(
			() => this.dispose(),
			workerKillTime
		)
	}

	dispose() {
		if (this.disposeTimeout) window.clearTimeout(this.disposeTimeout)

		this.resetSignal()
		this.worker?.terminate()
		this.task?.dispose()
		this.worker = null
		this._service = null
		this.workerClass = null
		this.disposeTimeout = undefined
	}

	protected abstract createWorker(): void
	protected abstract start(arg: StartArg): Promise<SignalData>
}
