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

		/**
		 * Setup theme meta tag
		 * @see ThemeManager.setThemeColor
		 */

		this.themeColorTag.setAttribute('name', 'theme-color')
		this.themeColorTag.id = 'theme-color-tag'
		//Only add one theme-color in dev environment with hot reloading
		if (!document.getElementById('theme-color-tag'))
			document.head.appendChild(this.themeColorTag)

		this.apply(
			new Theme({
				id: 'bridge.default.dark',
				colors: {
					toolbar: '#1e1e1e',
				},
			})
		)
	}

	apply(theme: Theme) {
		theme.apply(this)
	}

	/**
	 * Updates the top browser toolbar to match the main app's toolbar color
	 * @param color Color to set the toolbar to
	 */
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
