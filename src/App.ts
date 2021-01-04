import { EventManager } from './appCycle/EventSystem'
import { ThemeManager } from './appCycle/ThemeManager'

export class App {
	protected themeManager = new ThemeManager()
	protected eventSystem = new EventManager<any>()

	static main() {
		const app = new App()
		app.startUp()
	}

	startUp() {}
}
