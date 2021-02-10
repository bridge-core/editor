import { BaseWindow } from '../BaseWindow'
import BrowserUnsupportedComponent from './BrowserUnsupported.vue'

export class BrowserUnsupportedWindow extends BaseWindow {
	constructor() {
		super(BrowserUnsupportedComponent)
		this.defineWindow()
	}
}
