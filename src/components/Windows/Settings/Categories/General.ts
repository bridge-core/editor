import { Category } from './Category'
import { LocaleManager } from '@/libs/locales/Locales'

export class GeneralCategory extends Category {
	public name = 'windows.settings.general.name'
	public id = 'general'
	public icon = 'circle'

	constructor() {
		super()

		this.addDropdown(
			'language',
			'English',
			'windows.settings.general.language.name',
			'windows.settings.general.language.description',
			LocaleManager.getAvailableLanguages().map((language) => language.text)
		)
	}
}
