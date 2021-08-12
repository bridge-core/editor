import { BaseWindow } from '../BaseWindow'
import SocialsComponent from './Main.vue'

export class SocialsWindow extends BaseWindow {
	constructor() {
		super(SocialsComponent)
		this.defineWindow()
	}
}
