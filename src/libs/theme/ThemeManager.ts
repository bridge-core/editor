import { Theme, colorNames } from './Theme'
import { dark, light } from './DefaultThemes'
import { onMounted, onUnmounted, ref } from 'vue'
import { Settings } from '@/libs/settings/Settings'
import { get, set } from 'idb-keyval'
import { Event } from '@/libs/event/Event'
import { Disposable } from '@/libs/disposeable/Disposeable'
import { Extensions } from '@/libs/extensions/Extensions'

export class ThemeManager {
	public static themes: Theme[] = []
	public static currentTheme: string = dark.id
	public static themesUpdated: Event<undefined> = new Event()
	public static themeChanged: Event<undefined> = new Event()

	private static previouslyUsedTheme: Theme = this.prefersDarkMode() ? dark : light

	public static setup() {
		Settings.addSetting('colorScheme', {
			default: 'auto',
		})

		Settings.addSetting('darkTheme', {
			default: 'bridge.default.dark',
		})

		Settings.addSetting('lightTheme', {
			default: 'bridge.default.light',
		})

		Settings.updated.on((event) => {
			const { id, value } = event as { id: string; value: any }

			if (!['colorScheme', 'darkTheme', 'lightTheme'].includes(id)) return

			const colorScheme = Settings.get('colorScheme')

			let themeId = Settings.get('darkTheme')

			if (colorScheme === 'light' || (colorScheme === 'auto' && !ThemeManager.prefersDarkMode()))
				themeId = Settings.get('lightTheme')

			ThemeManager.applyTheme(themeId)
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

		this.themesUpdated.dispatch(undefined)
	}

	private static reloadThemes() {
		this.themes = []

		this.addTheme(dark)
		this.addTheme(light)

		if (Extensions.loaded) {
			if (!this.hasTheme(Settings.get('darkTheme'))) Settings.set('darkTheme', dark.id)
			if (!this.hasTheme(Settings.get('lightTheme'))) Settings.set('lightTheme', light.id)
		} else {
			this.addTheme(this.previouslyUsedTheme)
		}

		for (const theme of Extensions.themes) {
			this.addTheme(theme)
		}

		if (this.hasTheme(this.currentTheme)) {
			this.applyTheme(this.currentTheme)
		} else {
			this.applyTheme(this.prefersDarkMode() ? dark.id : light.id)
		}
	}

	private static applyTheme(themeId: string) {
		const theme = this.themes.find((theme) => theme.id === themeId)

		this.currentTheme = themeId

		if (!theme) return

		const root = <HTMLElement>document.querySelector(':root')

		for (const name of colorNames) {
			root.style.setProperty(`--theme-color-${name}`, theme.colors[name])
		}

		set('lastUsedTheme', JSON.stringify(theme))

		this.themeChanged.dispatch(undefined)
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
