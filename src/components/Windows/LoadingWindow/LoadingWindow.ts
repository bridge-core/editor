import { BaseWindow } from '@/components/Windows/BaseWindow'
import LoadingWindowComponent from './LoadingWindow.vue'

export class LoadingWindow extends BaseWindow {
	protected virtualWindows = 0

	constructor() {
		super(LoadingWindowComponent)
		this.defineWindow()
	}

	open() {
		this.virtualWindows++
		if (!this.isVisible) super.open()
	}
	close() {
		this.virtualWindows--

		if (this.virtualWindows === 0) {
			super.close()
		} else if (this.virtualWindows < 0) {
			this.virtualWindows = 0
			throw new Error(`Trying to close loadingWindow that doesn't exist`)
		}
	}
	closeAll() {
		this.virtualWindows = 0
		super.close()
	}
}
