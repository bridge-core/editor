import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'
import { Signal } from '/@/components/Common/Event/Signal'
import { App } from '/@/App'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { IDisposable } from '/@/types/disposable'
import json5 from 'json5'
import { deepMerge } from 'bridge-common-utils'
import { bridgeDark, bridgeLight } from './Default'
import { Theme } from './Theme'
import { AnyFileHandle } from '../../FileSystem/Types'

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
	'scrollbarThumb',
	'tabActive',
	'tabInactive',
	'lineHighlightBackground',
	'behaviorPack',
	'resourcePack',
	'worldTemplate',
	'skinPack',
] as const
export type TColorName = typeof colorNames[number]

export class ThemeManager extends EventDispatcher<'light' | 'dark'> {
	protected mode: 'light' | 'dark'
	protected themeMap = new Map<string, Theme>()
	protected themeColorTag: Element | null = null
	protected currentTheme = 'bridge.default.dark'
	public readonly colorScheme = new Signal<'light' | 'dark'>()

	constructor(protected vuetify: any) {
		super()

		// Listen for dark/light mode changes
		const media = window.matchMedia('(prefers-color-scheme: light)')
		this.mode = media.matches ? 'light' : 'dark'
		const onMediaChange = (mediaQuery: MediaQueryListEvent) => {
			this.colorScheme.dispatch(mediaQuery.matches ? 'light' : 'dark')
			this.mode = mediaQuery.matches ? 'light' : 'dark'
			this.updateTheme()
		}

		if ('addEventListener' in media) {
			media.addEventListener('change', (mediaQuery) =>
				onMediaChange(mediaQuery)
			)
		} else {
			// @ts-ignore This is for supporting older versions of Safari
			media.addListener((mediaQuery) => onMediaChange(mediaQuery))
		}

		/**
		 * Setup theme meta tag
		 * @see ThemeManager.setThemeColor
		 */
		const allThemeColorTags = document.querySelectorAll(
			"meta[name='theme-color']"
		)
		this.themeColorTag = allThemeColorTags[0] ?? null
		this.themeColorTag.removeAttribute('media')
		allThemeColorTags[1]?.remove()
		if (!this.themeColorTag) {
			this.themeColorTag = document.createElement('meta')
			this.themeColorTag.setAttribute('name', 'theme-color')
			document.head.appendChild(this.themeColorTag)
		}
		this.themeColorTag.id = 'theme-color-tag'

		this.addTheme(bridgeDark, true)
		this.addTheme(bridgeLight, true)
		this.applyTheme(this.themeMap.get('bridge.default.dark'))
	}

	getCurrentMode() {
		return this.mode
	}
	getCurrentTheme() {
		return this.themeMap.get(this.currentTheme)
	}

	protected applyTheme(theme?: Theme) {
		theme?.apply(this, this.vuetify)
	}
	async applyMonacoTheme() {
		this.themeMap.get(this.currentTheme)?.applyMonacoTheme()
	}
	async updateTheme() {
		const app = await App.getApp()
		let colorScheme = settingsState?.appearance?.colorScheme
		if (!colorScheme || colorScheme === 'auto') colorScheme = this.mode
		await app.projectManager.projectReady.fired

		const bridgeConfig = app.projectConfig.get().bridge
		const localThemeId =
			(colorScheme === 'light'
				? bridgeConfig?.lightTheme
				: bridgeConfig?.darkTheme) ?? 'bridge.noSelection'
		const themeId =
			<string>settingsState?.appearance?.[`${colorScheme}Theme`] ??
			`bridge.default.${colorScheme}`

		const themeToSelect =
			localThemeId !== 'bridge.noSelection' ? localThemeId : themeId
		const theme = this.themeMap.get(
			localThemeId !== 'bridge.noSelection' ? localThemeId : themeId
		)

		const baseTheme = this.themeMap.get(`bridge.default.${colorScheme}`)

		if (
			this.currentTheme !==
			(theme ? themeToSelect : `bridge.default.${colorScheme}`)
		) {
			this.currentTheme = theme
				? themeToSelect
				: `bridge.default.${colorScheme}`
			this.applyTheme(theme ?? baseTheme)
			this.dispatch(theme?.colorScheme ?? 'dark')
		}
	}
	async loadDefaultThemes(app: App) {
		await app.dataLoader.fired

		const themes = await app.dataLoader.readJSON(
			'data/packages/common/themes.json'
		)

		themes.map((theme: any) => this.addTheme(theme, true))

		this.updateTheme()
	}
	async loadTheme(
		fileHandle: AnyFileHandle,
		isGlobal = true,
		disposables?: IDisposable[]
	) {
		const file = await fileHandle.getFile()

		let themeDefinition
		try {
			themeDefinition = json5.parse(await file.text())
		} catch {
			throw new Error(`Failed to load theme "${file.name}"`)
		}

		const disposable = this.addTheme(themeDefinition, isGlobal)
		if (disposables) disposables.push(disposable)
	}

	getThemes(colorScheme?: 'dark' | 'light', global?: boolean) {
		const themes: Theme[] = []

		for (const [_, theme] of this.themeMap) {
			if (
				(!colorScheme || theme.colorScheme === colorScheme) &&
				(theme.isGlobal || global === theme.isGlobal)
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
				deepMerge(baseTheme?.getThemeDefinition() ?? {}, themeConfig),
				isGlobal
			)
		)
		this.updateTheme()

		return {
			dispose: () => this.themeMap.delete(themeConfig.id),
		}
	}

	getColor(colorName: TColorName) {
		const theme = this.themeMap.get(this.currentTheme)
		if (!theme) throw new Error(`No theme currently loaded`)
		return theme.getColor(colorName)
	}
	getHighlighterInfo(colorName: string) {
		const theme = this.themeMap.get(this.currentTheme)
		if (!theme) throw new Error(`No theme currently loaded`)
		return theme.getHighlighterInfo(colorName)
	}
}

export interface IThemeDefinition {
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
