import { Theme, colorNames } from './Theme'
import { dark } from './DefaultThemes'

export class ThemeManager {
	public themes: Theme[] = []
	public currentTheme: Theme = dark

	constructor() {
		this.addTheme(dark)
		this.applyTheme(dark.id)
	}

	public addTheme(theme: Theme) {
		this.themes.push(theme)

		this.applyTheme(theme.id)
	}

	private applyTheme(themeId: string) {
		const theme = this.themes.find((theme) => theme.id === themeId)

		if (!theme) return

		const root = <HTMLElement>document.querySelector(':root')

		for (const name of colorNames) {
			root.style.setProperty(`--theme-color-${name}`, theme.colors[name])
		}

		this.currentTheme = theme
	}
}
