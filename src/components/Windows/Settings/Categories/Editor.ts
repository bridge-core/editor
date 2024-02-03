import { Category } from './Category'

export class EditorCategory extends Category {
	public name = 'Editor'
	public id = 'editor'
	public icon = 'edit'

	constructor() {
		super()

		this.addToggle(
			'bracketPairColorization',
			false,
			'Bracket Pair Colorization',
			'Enable bracket pair colorization'
		)
	}
}
