import { ThemeManager } from '@/libs/theme/ThemeManager'
import { Category } from './Category'
import { computed } from 'vue'

export class AppearanceCategory extends Category {
	public name = 'windows.settings.appearance.name'
	public id = 'appearance'
	public icon = 'palette'

	constructor() {
		super()

		const themes = ThemeManager.useThemesImmediate()
		this.addDropdown(
			'theme',
			'Default Dark',
			'windows.settings.appearance.darkTheme.name',
			'windows.settings.appearance.darkTheme.description',
			computed(() => themes.value.map((theme) => theme.id)),
			async (theme: any) => {
				ThemeManager.applyTheme(theme)
			}
		)
	}
}
