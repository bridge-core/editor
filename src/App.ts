import { EventManager } from './appCycle/EventSystem'
import { ThemeManager } from './appCycle/ThemeManager'

export class App {
	protected themeManager
	protected eventSystem = new EventManager<any>()

	static main(appComponent: Vue) {
		console.log(appComponent)
		const app = new App(appComponent)
		app.startUp()
	}
	constructor(appComponent: Vue) {
		// @ts-expect-error Typescript doesn't know about vuetify
		this.themeManager = new ThemeManager(appComponent.$vuetify)
	}

	startUp() {}
}
