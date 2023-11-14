import { Progress } from '../Common/Progress'
import { EventDispatcher } from '../../libs/event/EventDispatcher'

export abstract class SimpleTaskService extends EventDispatcher<
	[number, number]
> {
	protected lastDispatch = 0
	public progress = new Progress(0, 100, 100)

	constructor() {
		super()
		this.progress.on(this.dispatch.bind(this))
	}

	dispatch(data: [number, number]) {
		// Always send last data batch
		if (data[0] === data[1]) super.dispatch(data)

		// Otherwise, first check that we don't send too many messages to the main thread
		if (this.lastDispatch + 200 > Date.now()) return

		super.dispatch(data)
		this.lastDispatch = Date.now()
	}
}
