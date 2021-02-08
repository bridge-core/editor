import { EventDispatcher } from '@/appCycle/EventSystem'
import Vue from 'vue'
import { editor as Editor } from 'monaco-editor'
import { keyword } from 'color-convert'
import { App } from '@/App'
import { settingsState } from '@/components/Windows/Settings/SettingsState'
import { iterateDir } from '@/utils/iterateDir'
import { IDisposable } from '@/types/disposable'
import json5 from 'json5'
import { deepmerge } from '@/utils/deepmerge'
import { bridgeDark, bridgeLight } from './Default'

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
	'sidebarSelection',
] as const
type TColorName = typeof colorNames[number]

export class ThemeManager extends EventDispatcher<'light' | 'dark'> {
	protected mode: 'light' | 'dark'
	protected themeMap = new Map<string, Theme>()
	protected themeColorTag = document.querySelector("meta[name='theme-color']")

	constructor(protected vuetify: any) {
		super()

		// Listen for dark/light mode changes
		const media = window.matchMedia('(prefers-color-scheme: light)')
		this.mode = media.matches ? 'light' : 'dark'
		media.addEventListener('change', mediaQuery => {
			this.dispatch(mediaQuery.matches ? 'light' : 'dark')
			this.mode = mediaQuery.matches ? 'light' : 'dark'
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

		this.addTheme(bridgeDark, true)
		this.addTheme(bridgeLight, true)
		this.applyTheme(this.themeMap.get('bridge.default.dark'))
	}

	protected applyTheme(theme?: Theme) {
		theme?.apply(this, this.vuetify)
	}
	updateTheme() {
		let colorScheme = settingsState?.appearance?.colorScheme
		if (!colorScheme || colorScheme === 'auto') colorScheme = this.mode

		const themeId =
			<string>settingsState?.appearance?.[`${colorScheme}Theme`] ??
			`bridge.default.${colorScheme}`
		const theme = this.themeMap.get(themeId)
		const baseTheme = this.themeMap.get(`bridge.default.${colorScheme}`)

		this.applyTheme(theme ?? baseTheme)
	}
	async loadDefaultThemes(app: App) {
		try {
			await iterateDir(
				await app.fileSystem.getDirectoryHandle('data/packages/themes'),
				fileHandle => this.loadTheme(fileHandle)
			)
		} catch {}

		this.updateTheme()
	}
	async loadTheme(
		fileHandle: FileSystemFileHandle,
		isGlobal = true,
		disposables?: IDisposable[]
	) {
		const file = await fileHandle.getFile()
		const themeDefinition = json5.parse(await file.text())

		const disposable = this.addTheme(themeDefinition, isGlobal)
		if (disposables) disposables.push(disposable)
	}

	getThemes(colorScheme?: 'dark' | 'light', global?: boolean) {
		const themes: Theme[] = []

		for (const [_, theme] of this.themeMap) {
			if (
				(!colorScheme || theme.colorScheme === colorScheme) &&
				(!global || global === theme.isGlobal)
			)
				themes.push(theme)
		}

		return themes
	}

	/**
	 * Updates the top browser toolbar to match the main app's toolbar color
	 * @param color Color to set the toolbar to
	 */
	setThemeColor(color: string) {
		this.themeColorTag!.setAttribute('content', color)
	}

	addTheme(themeConfig: IThemeDefinition, isGlobal: boolean) {
		const baseTheme = this.themeMap.get(
			`bridge.default.${themeConfig.colorScheme ?? 'dark'}`
		)

		this.themeMap.set(
			themeConfig.id,
			new Theme(
				deepmerge(baseTheme?.getThemeDefinition() ?? {}, themeConfig),
				isGlobal
			)
		)
		this.updateTheme()

		return {
			dispose: () => this.themeMap.delete(themeConfig.id),
		}
	}
}

export interface IThemeDefinition {
	id: string
	name: string
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
	public readonly name: string

	protected colorMap: Map<TColorName, string>
	protected highlighterDef: IThemeDefinition['highlighter']
	protected monacoDef: IThemeDefinition['monaco']

	protected monacoSubTheme: MonacoSubTheme

	constructor(
		protected themeDefinition: IThemeDefinition,
		public readonly isGlobal: boolean
	) {
		this.id = themeDefinition.id
		this.name = themeDefinition.name
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
	getThemeDefinition() {
		return this.themeDefinition
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
