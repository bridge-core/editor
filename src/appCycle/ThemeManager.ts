import { EventDispatcher } from './EventSystem'
import Vue from 'vue'

const colorNames = [
	'text',
	'toolbar',
	'expandedSidebar',
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
] as const
type TColorName = typeof colorNames[number]

export class ThemeManager extends EventDispatcher<'light' | 'dark'> {
	public readonly mode: 'light' | 'dark'
	protected themeMap = new Set<Theme>()
	protected themeColorTag =
		document.getElementById('theme-color-tag') ??
		document.createElement('meta')

	constructor(protected vuetify: any) {
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

		this.apply(bridgeDark)
	}

	apply(theme: Theme) {
		theme.apply(this, this.vuetify)
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
	colorScheme?: 'dark' | 'light'
	colors: Record<TColorName, string>
}

export class Theme {
	protected colorMap: Map<TColorName, string>
	protected colorScheme: 'dark' | 'light'

	constructor(themeDefinition: IThemeDefinition) {
		this.colorMap = new Map(
			<[TColorName, string][]>Object.entries(themeDefinition.colors)
		)
		this.colorScheme = themeDefinition.colorScheme ?? 'dark'
	}

	apply(themeManager: ThemeManager, vuetify: any) {
		Vue.set(
			vuetify.theme.themes,
			this.colorScheme,
			Object.fromEntries(this.colorMap.entries())
		)
		Vue.set(vuetify.theme, 'dark', this.colorScheme === 'dark')

		themeManager.setThemeColor(this.colorMap.get('toolbar') ?? 'red')
	}
}

const bridgeDark = new Theme({
	id: 'bridge.default.dark',
	colorScheme: 'dark',
	colors: {
		text: '#fff',

		primary: '#1778D2',
		secondary: '#1778D2',
		accent: '#1778D2',
		error: '#ff5252',
		info: '#2196f3',
		warning: '#fb8c00',
		success: '#4caf50',

		background: '#121212',
		sidebarNavigation: '#1F1F1F',
		expandedSidebar: '#1F1F1F',
		menu: '#424242',
		footer: '#111111',
		tooltip: '#1F1F1F',
		toolbar: '#000',
	},
})

const bridgeLight = new Theme({
	id: 'bridge.default.light',
	colorScheme: 'light',
	colors: {
		text: '#000',

		primary: '#1778D2',
		secondary: '#1778D2',
		accent: '#1778D2',
		error: '#ff5252',
		info: '#2196f3',
		warning: '#fb8c00',
		success: '#4caf50',

		background: '#fafafa',
		sidebarNavigation: '#FFFFFF',
		expandedSidebar: '#FFFFFF',
		menu: '#fff',
		tooltip: '#424242',
		toolbar: '#e0e0e0',
		footer: '#f5f5f5',
	},
})
