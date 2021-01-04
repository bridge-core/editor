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
	protected themeColorTag = document.createElement('meta')

	constructor() {
		super()

		// Listen for dark/light mode changes
		const media = window.matchMedia('(prefers-color-scheme: light)')
		this.mode = media.matches ? 'light' : 'dark'
		media.addEventListener('change', mediaQuery => {
			this.dispatch(mediaQuery.matches ? 'light' : 'dark')
		})

		// Setup
		this.themeColorTag.setAttribute('name', 'theme-color')
		document.head.appendChild(this.themeColorTag)
	}

	apply(theme: Theme) {
		theme.apply(this)
	}

	setThemeColor(color: string) {
		this.themeColorTag.setAttribute('content', color)
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

	apply(themeManager: ThemeManager) {
		colorNames.forEach(color => this.applyColor(color))

		themeManager.setThemeColor(this.colorMap.get('toolbar') ?? 'red')
	}

	applyColor(colorName: string) {
		document.documentElement.style.setProperty(
			`--${colorName}`,
			this.colorMap.get(colorName) ?? 'red'
		)
	}
}
