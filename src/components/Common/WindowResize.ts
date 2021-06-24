import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'
import { debounce } from 'lodash-es'
import { reactive } from '@vue/composition-api'

export class WindowResize extends EventDispatcher<[number, number]> {
	protected state = reactive({
		currentHeight: window.innerHeight,
		currentWidth: window.innerWidth,
	})

	constructor() {
		super()

		window.addEventListener(
			'resize',
			debounce(() => this.dispatch(), 200, { trailing: true })
		)

		this.on(([newWidth, newHeight]) => {
			this.state.currentWidth = newWidth
			this.state.currentHeight = newHeight
		})
	}

	dispatch() {
		super.dispatch([window.innerWidth, window.innerHeight])
	}
}
