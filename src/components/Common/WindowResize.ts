import { EventDispatcher } from '@/components/Common/Event/EventDispatcher'
import debounce from 'lodash.debounce'

export class WindowResize extends EventDispatcher<[number, number]> {
	constructor() {
		super()

		window.addEventListener(
			'resize',
			debounce(
				() => this.dispatch([window.innerWidth, window.innerHeight]),
				100
			)
		)
	}
}
