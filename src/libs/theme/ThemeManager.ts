import { Theme, colorNames } from './Theme'
import { dark } from './DefaultThemes'
import { onMounted, onUnmounted, ref } from 'vue'
import { EventSystem } from '@/libs/event/EventSystem'

export class ThemeManager {
	public themes: Theme[] = []
	public currentTheme: string = dark.id
	public eventSystem = new EventSystem(['themesUpdated'])

	constructor() {
		this.addTheme(dark)
		this.applyTheme(dark.id)
	}

	public addTheme(theme: Theme) {
		this.themes.push(theme)

		this.eventSystem.dispatch('themesUpdated', null)
	}

	public applyTheme(themeId: string) {
		const theme = this.themes.find((theme) => theme.id === themeId)

		this.currentTheme = themeId

		if (!theme) return

		const root = <HTMLElement>document.querySelector(':root')

		for (const name of colorNames) {
			root.style.setProperty(`--theme-color-${name}`, theme.colors[name])
		}
	}

	public reloadTheme() {
		console.warn('reloading theme', this.currentTheme)

		this.applyTheme(this.currentTheme)
	}

	public useThemes() {
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

	public useThemesImmediate() {
		const themes = ref(this.themes)

		const me = this

		function update() {
			themes.value = [...me.themes]
		}

		this.eventSystem.on('themesUpdated', update)

		return themes
	}
}
