import { ThemeManager } from '@/libs/theme/ThemeManager'
import { Category } from '../Category'
import { computed } from 'vue'
import ColorScheme from './ColorScheme.vue'
import { settings } from '@/App'

export class AppearanceCategory extends Category {
	public name = 'windows.settings.appearance.name'
	public id = 'appearance'
	public icon = 'palette'

	constructor() {
		super()

		this.addCustom(ColorScheme, 'colorScheme')

		this.addSetting(
			'colorScheme',
			'auto',
			'windows.settings.appearance.colorScheme.name',
			'windows.settings.appearance.colorScheme.description',
			async (value, initial) => {
				console.log(value, settings.get('darkTheme'), settings.get('lightTheme'))

				if (value === 'auto') value = ThemeManager.prefersDarkMode() ? 'dark' : 'light'

				if (value === 'dark') {
					ThemeManager.applyTheme(settings.get('darkTheme'))
				}

				if (value === 'light') {
					ThemeManager.applyTheme(settings.get('lightTheme'))
				}
			},
			undefined,
			undefined
		)

		const themes = ThemeManager.useThemesImmediate()
		const darkTheme = computed(() => themes.value.filter((theme) => theme.colorScheme === 'dark'))
		const lightTheme = computed(() => themes.value.filter((theme) => theme.colorScheme === 'light'))

		this.addDropdown(
			'darkTheme',
			'Default Dark',
			'windows.settings.appearance.darkTheme.name',
			'windows.settings.appearance.darkTheme.description',
			computed(() => darkTheme.value.map((theme) => theme.id)),
			async (theme: any, initial: boolean) => {
				if (initial) return

				if (
					settings.get('colorScheme') !== 'dark' &&
					!(settings.get('colorScheme') === 'auto' && ThemeManager.prefersDarkMode())
				)
					return

				ThemeManager.applyTheme(theme)
			}
		)

		this.addDropdown(
			'lightTheme',
			'Default Light',
			'windows.settings.appearance.lightTheme.name',
			'windows.settings.appearance.lightTheme.description',
			computed(() => lightTheme.value.map((theme) => theme.id)),
			async (theme: any, initial: boolean) => {
				if (initial) return

				if (
					settings.get('colorScheme') !== 'light' &&
					!(settings.get('colorScheme') === 'auto' && !ThemeManager.prefersDarkMode())
				)
					return

				ThemeManager.applyTheme(theme)
			}
		)
	}
}
