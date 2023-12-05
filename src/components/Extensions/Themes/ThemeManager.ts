import { bridgeDark, bridgeLight } from './Default'

const colorNames = [
	'text',
	'textAlternate',

	'primary',
	'secondary',
	'accent',
	'error',
	'info',
	'warning',
	'success',

	'background',
	'menu',
	'menuAlternate',

	'expandedSidebar',
	'sidebarNavigation',
	'toolbar',
	'footer',
	'tooltip',
	'sidebarSelection',
	'scrollbarThumb',
	'tabActive',
	'tabInactive',
	'lineHighlightBackground',
	'behaviorPack',
	'resourcePack',
	'worldTemplate',
	'skinPack',
] as const

export type TColorName = (typeof colorNames)[number]

export type TThemeDefinition = {
	id: string
	name: string
	colorScheme?: 'dark' | 'light'
	colors: Record<TColorName, string>
	highlighter?: Record<
		string,
		{
			color?: string
			background?: string
			textDecoration?: string
			isItalic?: boolean
		}
	>
	monaco?: Record<string, string>
}

export class ThemeManager {
	public currentTheme: TThemeDefinition = bridgeDark

	constructor() {
		this.applyTheme(bridgeDark)
	}

	protected applyTheme(theme?: TThemeDefinition) {
		if (!theme) return

		const root = <HTMLElement>document.querySelector(':root')

		for (const name of colorNames) {
			root.style.setProperty(`--theme-color-${name}`, theme.colors[name])
		}

		this.currentTheme = theme
	}
}
