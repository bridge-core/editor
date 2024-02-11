import { Theme, colorNames } from './Theme'
import { dark, light } from './DefaultThemes'
import { onMounted, onUnmounted, ref } from 'vue'
import { EventSystem } from '@/libs/event/EventSystem'
import { get, set } from 'idb-keyval'

export class ThemeManager {
	public static themes: Theme[] = []
	public static currentTheme: string = dark.id
	public static eventSystem = new EventSystem(['themesUpdated', 'themeChanged'])

	public static setup() {
		this.addTheme(dark)
		this.addTheme(light)
	}

	public static async load() {
		let lastUsedTheme: Theme = this.prefersDarkMode() ? dark : light
		try {
			lastUsedTheme = JSON.parse((await get('lastUsedTheme')) as string)
		} catch {}

		this.addTheme(lastUsedTheme)
		this.applyTheme(lastUsedTheme.id)
	}

	public static addTheme(theme: Theme) {
		const duplicateIndex = this.themes.findIndex((otherTheme) => otherTheme.id === theme.id)

		if (duplicateIndex !== -1) {
			this.themes[duplicateIndex] = theme
		} else {
			this.themes.push(theme)
		}

		this.eventSystem.dispatch('themesUpdated', null)
	}

	public static removeTheme(theme: Theme) {
		this.themes = this.themes.filter((otherTheme) => otherTheme.id !== theme.id)

		this.eventSystem.dispatch('themesUpdated', null)

		if (this.currentTheme === theme.id) this.applyTheme(dark.id)
	}

	public static applyTheme(themeId: string) {
		const theme = this.themes.find((theme) => theme.id === themeId)

		this.currentTheme = themeId

		if (!theme) return

		const root = <HTMLElement>document.querySelector(':root')

		for (const name of colorNames) {
			root.style.setProperty(`--theme-color-${name}`, theme.colors[name])
		}

		set('lastUsedTheme', JSON.stringify(theme))

		this.eventSystem.dispatch('themeChanged', undefined)
	}

	public static reloadTheme() {
		this.applyTheme(this.currentTheme)
	}

	public static get(currentTheme: string): Theme {
		return {
			...dark,
			...this.themes.find((theme) => theme.id === this.currentTheme),
		}
	}

	public static useThemes() {
		const themes = ref(this.themes)

		const me = this

		function update() {
			themes.value = [...me.themes]
		}

		onMounted(() => {
			this.eventSystem.on('themesUpdated', update)
		})

		onUnmounted(() => {
			this.eventSystem.off('themesUpdated', update)
		})

		return themes
	}

	public static useThemesImmediate() {
		const themes = ref(this.themes)

		const me = this

		function update() {
			themes.value = [...me.themes]
		}

		this.eventSystem.on('themesUpdated', update)

		return themes
	}

	public static prefersDarkMode(): boolean {
		return window.matchMedia('(prefers-color-scheme: dark)').matches
	}
}
