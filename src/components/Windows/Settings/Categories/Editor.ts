import { Category } from './Category'

export class EditorCategory extends Category {
	public name = 'windows.settings.editor.name'
	public id = 'editor'
	public icon = 'edit'

	constructor() {
		super()

		this.addToggle(
			'bracketPairColorization',
			false,
			'windows.settings.editor.bracketPairColorization.name',
			'windows.settings.editor.bracketPairColorization.description'
		)
	}
}
