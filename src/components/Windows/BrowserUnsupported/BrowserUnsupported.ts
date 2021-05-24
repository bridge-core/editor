import { BaseWindow } from '../BaseWindow'
import BrowserUnsupportedComponent from './BrowserUnsupported.vue'
import { App } from '/@/App'

export class BrowserUnsupportedWindow extends BaseWindow {
	constructor() {
		super(BrowserUnsupportedComponent)
		this.defineWindow()
	}
}
