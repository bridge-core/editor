import { BaseWindow } from '../BaseWindow'
import DiscordComponent from './Main.vue'

export class DiscordWindow extends BaseWindow {
	constructor() {
		super(DiscordComponent)
		this.defineWindow()
	}
}
