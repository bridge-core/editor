import { EventManager } from './appCycle/EventSystem'
import { ThemeManager } from './appCycle/ThemeManager'
import { mainTabSystem } from './components/TabSystem/Main'

export class App {
	protected themeManager: ThemeManager
	protected eventSystem = new EventManager<any>()

	static main(appComponent: Vue) {
		const app = new App(appComponent)
		app.startUp()
	}
	constructor(appComponent: Vue) {
		// @ts-expect-error Typescript doesn't know about vuetify
		this.themeManager = new ThemeManager(appComponent.$vuetify)

		// Prompt the user whether they really want to close bridge. when unsaved tabs are open
		const saveWarning =
			'Are you sure that you want to close bridge.? Unsaved progress will be lost.'
		window.addEventListener('beforeunload', event => {
			if (mainTabSystem.hasUnsavedTabs) {
				event.preventDefault()
				event.returnValue = saveWarning
				return saveWarning
			}
		})
	}

	static createNativeWindow(url: string, id?: string) {
		window.open(url, id, 'toolbar=no,menubar=no,status=no')
	}

	startUp() {}
}
