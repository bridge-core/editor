import { ThemeManager } from './appCycle/ThemeManager'

export class App {
	protected themeManager = new ThemeManager()

	static main() {
		const app = new App()
		app.startUp()
	}

	startUp() {}
}
