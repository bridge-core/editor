import { NewBaseWindow } from '../NewBaseWindow'
import SocialsComponent from './Main.vue'

export class SocialsWindow extends NewBaseWindow {
	constructor() {
		super(SocialsComponent)
		this.defineWindow()
	}
}
