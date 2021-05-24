import { BaseWindow } from '/@/components/Windows/BaseWindow'
import LoadingWindowComponent from './LoadingWindow.vue'

export class LoadingWindow extends BaseWindow {
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
		//new Audio('/audio/click5.ogg').play()
		this.virtualWindows++
		this.loadingMessages.push(message)
		if (!this.isVisible) super.open()
	}
	close() {
		//new Audio('/audio/click5.ogg').play()
		this.virtualWindows--
		this.loadingMessages.pop()

		if (this.virtualWindows === 0) {
			super.close()
		} else if (this.virtualWindows < 0) {
			this.virtualWindows = 0
		}
	}
	closeAll() {
		//new Audio('/audio/click5.ogg').play()
		this.virtualWindows = 0
		this.loadingMessages = []
		super.close()
	}
}
