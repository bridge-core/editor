import { NewBaseWindow } from '../NewBaseWindow'
import BrowserUnsupportedComponent from './BrowserUnsupported.vue'
import { App } from '/@/App'

export class BrowserUnsupportedWindow extends NewBaseWindow {
	constructor() {
		super(BrowserUnsupportedComponent)
		this.defineWindow()
	}
}
