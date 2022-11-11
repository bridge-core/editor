import LoadingWindowComponent from './LoadingWindow.vue'
import { NewBaseWindow } from '../NewBaseWindow'

export class LoadingWindow extends NewBaseWindow {
	protected virtualWindows = 0
	protected loadingMessages: (string | undefined)[] = []

	constructor() {
		super(LoadingWindowComponent)
		this.defineWindow()
	}

	get message() {
		return this.loadingMessages[this.loadingMessages.length - 1]
	}

	open(message?: string) {
		this.virtualWindows++
		this.loadingMessages.push(message)
		if (!this.state.isVisible) super.open()
	}
	close() {
		this.virtualWindows--
		this.loadingMessages.pop()

		if (this.virtualWindows === 0) {
			super.close()
		} else if (this.virtualWindows < 0) {
			this.virtualWindows = 0
		}
	}
	closeAll() {
		this.virtualWindows = 0
		this.loadingMessages = []
		super.close()
	}
}
