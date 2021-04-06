import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'
import { debounce } from 'lodash-es'

export class WindowResize extends EventDispatcher<[number, number]> {
	constructor() {
		super()

		window.addEventListener(
			'resize',
			debounce(() => this.dispatch(), 200, { trailing: true })
		)
	}

	dispatch() {
		super.dispatch([window.innerWidth, window.innerHeight])
	}
}
