import { EventDispatcher } from './EventSystem'

const colorNames = [
	'text',
	'toolbar',
	'sidebar',
	'sidebarNavigation',
	'primary',
	'secondary',
	'accent',
	'error',
	'info',
	'warning',
	'success',
	'background',
	'menu',
	'footer',
	'tooltip',
]

export class ThemeManager extends EventDispatcher<'light' | 'dark'> {
	public readonly mode: 'light' | 'dark'
	protected themeMap = new Set<Theme>()

	constructor() {
		super()

		const media = window.matchMedia('(prefers-color-scheme: light)')
		this.mode = media.matches ? 'light' : 'dark'

		media.addEventListener('change', mediaQuery => {
			this.dispatch(mediaQuery.matches ? 'light' : 'dark')
		})
	}

	apply(theme: Theme) {
		theme.apply()
	}
}

export interface IThemeDefinition {
	id: string
	colors: Record<string, string>
}

export class Theme {
	protected colorMap: Map<string, string>

	constructor(themeDefinition: IThemeDefinition) {
		this.colorMap = new Map(Object.entries(themeDefinition.colors))
	}

	apply() {
		colorNames.forEach(color => this.applyColor(color))
	}

	applyColor(colorName: string) {
		document.documentElement.style.setProperty(
			`--${colorName}`,
			this.colorMap.get(colorName) ?? 'red'
		)
	}
}
