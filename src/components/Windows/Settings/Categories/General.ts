import { Category } from './Category'
import { LocaleManager } from '@/libs/locales/Locales'

export class GeneralCategory extends Category {
	public name = 'General'
	public id = 'general'
	public icon = 'circle'

	constructor() {
		super()

		this.addDropdown(
			'language',
			'English',
			'Language',
			'Choose a language for bridge. to use.',
			LocaleManager.getAvailableLanguages().map(
				(language) => language.text
			),
			(value) =>
				LocaleManager.applyLanguage(
					LocaleManager.getAvailableLanguages().find(
						(language) => language.text === value
					)?.value || LocaleManager.getCurrentLanguageId()
				)
		)
	}
}
