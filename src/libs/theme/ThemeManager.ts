import { Theme, colorNames } from './Theme'
import { dark } from './DefaultThemes'

export class ThemeManager {
	public currentTheme: Theme = dark

	constructor() {
		this.applyTheme(dark)
	}

	protected applyTheme(theme?: Theme) {
		if (!theme) return

		const root = <HTMLElement>document.querySelector(':root')

		for (const name of colorNames) {
			root.style.setProperty(`--theme-color-${name}`, theme.colors[name])
		}

		this.currentTheme = theme
	}
}
