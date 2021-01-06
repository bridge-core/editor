import { EventDispatcher } from './EventSystem'
import Vue from 'vue'
import { editor as Editor } from 'monaco-editor'
import { keyword } from 'color-convert'

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
	protected themeColorTag = document.querySelector("meta[name='theme-color']")

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
		if (!this.themeColorTag) {
			this.themeColorTag = document.createElement('meta')
			document.head.appendChild(this.themeColorTag)
		}
		this.themeColorTag.setAttribute('name', 'theme-color')
		this.themeColorTag.id = 'theme-color-tag'

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
		this.themeColorTag!.setAttribute('content', color)
	}
}

export interface IThemeDefinition {
	id: string
	colorScheme?: 'dark' | 'light'
	colors: Record<TColorName, string>
	highlighter?: Record<
		string,
		{ color?: string; textDecoration?: string; isItalic?: boolean }
	>
	monaco?: Record<string, string>
}

export class Theme {
	public readonly id: string
	public readonly colorScheme: 'dark' | 'light'

	protected colorMap: Map<TColorName, string>
	protected highlighterDef: IThemeDefinition['highlighter']
	protected monacoDef: IThemeDefinition['monaco']

	protected monacoSubTheme: MonacoSubTheme

	constructor(themeDefinition: IThemeDefinition) {
		this.id = themeDefinition.id
		this.colorScheme = themeDefinition.colorScheme ?? 'dark'

		this.colorMap = new Map(
			<[TColorName, string][]>Object.entries(themeDefinition.colors)
		)
		this.monacoDef = themeDefinition.monaco
		this.highlighterDef = themeDefinition.highlighter

		this.monacoSubTheme = new MonacoSubTheme(this)
	}

	apply(themeManager: ThemeManager, vuetify: any) {
		Vue.set(
			vuetify.theme.themes,
			this.colorScheme,
			Object.fromEntries(this.colorMap.entries())
		)
		Vue.set(vuetify.theme, 'dark', this.colorScheme === 'dark')

		themeManager.setThemeColor(this.colorMap.get('toolbar') ?? 'red')
		this.monacoSubTheme.apply()
	}

	getColor(colorName: TColorName) {
		return this.colorMap.get(colorName) ?? 'red'
	}
	getMonacoDefinition() {
		return this.monacoDef ?? {}
	}
	getHighlighterDefinition() {
		return this.highlighterDef ?? {}
	}
}

export class MonacoSubTheme {
	constructor(protected theme: Theme) {}

	apply() {
		Editor.defineTheme('bridge-monaco-default', {
			base: this.theme.colorScheme === 'light' ? 'vs' : 'vs-dark',
			inherit: false,
			colors: {
				'editor.background': this.convertColor(
					this.theme.getColor('background')
				),
				'editor.lineHighlightBackground': this.convertColor(
					this.theme.getColor('tooltip')
				),
				'editorWidget.background': this.convertColor(
					this.theme.getColor('background')
				),
				'editorWidget.border': this.convertColor(
					this.theme.getColor('sidebarNavigation')
				),
				'pickerGroup.background': this.convertColor(
					this.theme.getColor('background')
				),
				'pickerGroup.border': this.convertColor(
					this.theme.getColor('sidebarNavigation')
				),
				'badge.background': this.convertColor(
					this.theme.getColor('background')
				),

				'input.background': this.convertColor(
					this.theme.getColor('sidebarNavigation')
				),
				'input.border': this.convertColor(this.theme.getColor('menu')),
				'inputOption.activeBorder': this.convertColor(
					this.theme.getColor('primary')
				),
				focusBorder: this.convertColor(this.theme.getColor('primary')),
				'list.focusBackground': this.convertColor(
					this.theme.getColor('menu')
				),
				'list.hoverBackground': this.convertColor(
					this.theme.getColor('sidebarNavigation')
				),
				contrastBorder: this.convertColor(
					this.theme.getColor('sidebarNavigation')
				),

				'peekViewTitle.background': this.convertColor(
					this.theme.getColor('background')
				),
				'peekView.border': this.convertColor(
					this.theme.getColor('primary')
				),
				'peekViewResult.background': this.convertColor(
					this.theme.getColor('sidebarNavigation')
				),
				'peekViewResult.selectionBackground': this.convertColor(
					this.theme.getColor('menu')
				),
				'peekViewEditor.background': this.convertColor(
					this.theme.getColor('background')
				),
				'peekViewEditor.matchHighlightBackground': this.convertColor(
					this.theme.getColor('menu')
				),
				...this.theme.getMonacoDefinition(),
			},
			rules: [
				//@ts-ignore Token is not required
				{
					background: this.convertColor(
						this.theme.getColor('background')
					),
					foreground: this.convertColor(this.theme.getColor('text')),
				},
				...Object.entries(this.theme.getHighlighterDefinition())
					.map(([token, { color, textDecoration, isItalic }]) => ({
						token: token,
						foreground: this.convertColor(color as string),
						fontStyle: `${
							isItalic ? 'italic ' : ''
						}${textDecoration}`,
					}))
					.filter(({ foreground }) => foreground !== undefined),
			],
		})
	}

	convertColor(color: string) {
		if (!color) return color
		if (color.startsWith('#')) {
			if (color.length === 4) {
				return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
			}
			return color
		}

		return keyword.hex(color as any)
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
		toolbar: '#000000',
	},
	highlighter: {
		type: {
			color: '#a6e22e',
		},
		keyword: {
			color: '#f92672',
		},
		definition: {
			color: '#fd971f',
		},
		atom: {
			color: '#ae81ff',
		},
		number: {
			color: '#ae81ff',
		},
		string: {
			color: '#e6db74',
		},
		variable: {
			color: '#9effff',
		},
		variable_strong: {
			color: '#9effff',
		},
		meta: {
			color: 'white',
		},
		comment: {
			color: '#75715e',
		},
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
	highlighter: {
		property: {
			color: 'black',
		},
		keyword: {
			color: '#5A5CAD',
		},
		definition: {
			textDecoration: 'underline',
		},
		atom: {
			color: '#6C8CD5',
		},
		number: {
			color: '#164',
		},
		string: {
			color: 'red',
		},
		variable: {
			color: 'black',
		},
		variable_strong: {
			color: 'black',
		},
		meta: {
			color: 'yellow',
		},
		comment: {
			color: '#0080FF',
		},
	},
})
