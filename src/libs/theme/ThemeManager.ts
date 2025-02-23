import { Theme, colorNames } from './Theme'
import { dark, light } from './DefaultThemes'
import { onMounted, onUnmounted, ref } from 'vue'
import { Settings } from '@/libs/settings/Settings'
import { get, set } from 'idb-keyval'
import { Event } from '@/libs/event/Event'
import { Disposable } from '@/libs/disposeable/Disposeable'
import { Extensions } from '@/libs/extensions/Extensions'

export enum ThemeSettings {
	ColorScheme = 'colorScheme',
	DarkTheme = 'darkTheme',
	LightTheme = 'lightTheme',
	Font = 'font',
	EditorFont = 'editorFont',
	EditorFontSize = 'editorFontSize',
}

export class ThemeManager {
	public static themes: Theme[] = []
	public static currentTheme: string = dark.id
	public static themesUpdated: Event<void> = new Event()
	public static themeChanged: Event<void> = new Event()

	private static previouslyUsedTheme: Theme = this.prefersDarkMode() ? dark : light
	private static lastTheme: Theme | null = null

	public static setup() {
		Settings.addSetting(ThemeSettings.ColorScheme, {
			default: 'auto',
		})

		Settings.addSetting(ThemeSettings.DarkTheme, {
			default: 'bridge.default.dark',
		})

		Settings.addSetting(ThemeSettings.LightTheme, {
			default: 'bridge.default.light',
		})

		Settings.addSetting(ThemeSettings.Font, {
			default: 'Inter',
		})

		Settings.addSetting(ThemeSettings.EditorFont, {
			default: 'Consolas',
		})

		Settings.addSetting(ThemeSettings.EditorFontSize, {
			default: 14,
		})

		Settings.updated.on((event) => {
			const { id, value } = event as { id: string; value: any }

			if (
				!(<string[]>[
					ThemeSettings.ColorScheme,
					ThemeSettings.DarkTheme,
					ThemeSettings.LightTheme,
					ThemeSettings.Font,
					ThemeSettings.EditorFont,
					ThemeSettings.EditorFontSize,
				]).includes(id)
			)
				return

			const colorScheme = Settings.get(ThemeSettings.ColorScheme)

			let themeId = Settings.get(ThemeSettings.DarkTheme)

			if (colorScheme === 'light' || (colorScheme === 'auto' && !ThemeManager.prefersDarkMode())) themeId = Settings.get(ThemeSettings.LightTheme)

			ThemeManager.applyTheme(themeId as string)
		})

		Extensions.updated.on((event) => {
			this.reloadThemes()
		})
	}

	public static async load() {
		try {
			this.previouslyUsedTheme = JSON.parse((await get('lastUsedTheme')) as string)
		} catch {}

		this.reloadThemes()
		this.applyTheme(this.previouslyUsedTheme.id)
	}

	private static addTheme(theme: Theme) {
		const duplicateIndex = this.themes.findIndex((otherTheme) => otherTheme.id === theme.id)

		if (duplicateIndex !== -1) {
			this.themes[duplicateIndex] = theme
		} else {
			this.themes.push(theme)
		}

		this.themesUpdated.dispatch()
	}

	private static reloadThemes() {
		this.themes = []

		this.addTheme(dark)
		this.addTheme(light)

		for (const theme of Extensions.themes) {
			this.addTheme(theme)
		}

		if (Extensions.loaded) {
			if (!this.hasTheme(Settings.get('darkTheme'))) Settings.set('darkTheme', dark.id)
			if (!this.hasTheme(Settings.get('lightTheme'))) Settings.set('lightTheme', light.id)
		} else {
			this.addTheme(this.previouslyUsedTheme)
		}

		if (this.hasTheme(this.currentTheme)) {
			this.applyTheme(this.currentTheme)
		} else {
			this.applyTheme(this.prefersDarkMode() ? dark.id : light.id)
		}
	}

	private static applyTheme(themeId: string) {
		const theme = this.themes.find((theme) => theme.id === themeId)

		if (!theme) return

		if (this.lastTheme === theme) return

		this.currentTheme = themeId

		const root = <HTMLElement>document.querySelector(':root')

		for (const name of colorNames) {
			root.style.setProperty(`--theme-color-${name}`, theme.colors[name])
		}

		root.style.setProperty('--theme-font', Settings.get(ThemeSettings.Font))
		root.style.setProperty('--theme-font-editor', Settings.get(ThemeSettings.EditorFont))
		root.style.setProperty('--theme-font-size-editor', Settings.get(ThemeSettings.EditorFontSize) + 'px')

		set('lastUsedTheme', JSON.stringify(theme))
		this.previouslyUsedTheme = theme

		this.lastTheme = theme

		this.themeChanged.dispatch()
	}

	public static get(themeId: string): Theme {
		return {
			...dark,
			...this.themes.find((theme) => theme.id === themeId),
		}
	}

	public static hasTheme(themeId: string): boolean {
		return this.themes.find((theme) => theme.id === themeId) !== undefined
	}

	public static useThemes() {
		const themes = ref(this.themes)

		const me = this

		function update() {
			themes.value = [...me.themes]
		}

		let disposable: Disposable

		onMounted(() => {
			disposable = ThemeManager.themesUpdated.on(update)
		})

		onUnmounted(() => {
			disposable.dispose()
		})

		return themes
	}

	public static useThemesImmediate() {
		const themes = ref(this.themes)

		const me = this

		function update() {
			themes.value = [...me.themes]
		}

		ThemeManager.themesUpdated.on(update)

		return themes
	}

	public static prefersDarkMode(): boolean {
		return window.matchMedia('(prefers-color-scheme: dark)').matches
	}
}
