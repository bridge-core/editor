import { ThemeManager } from '/@/components/Extensions/Themes/ThemeManager'

export class App {
	public static instance: App

	protected themeManager = new ThemeManager()

	get projectSelected() {
		return false
	}

	public static async main() {
		console.time('[APP] Ready')

		App.instance = new App()

		console.timeEnd('[APP] Ready')
	}
}
