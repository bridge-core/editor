import { Category } from './Category'

export class GeneralCategory extends Category {
	public name = 'General'
	public id = 'general'
	public icon = 'circle'

	constructor() {
		super()

		this.addDropdown(
			'language',
			'Language',
			'Choose a language for bridge. to use.',
			['English', 'Test']
		)
	}
}
