import { ActionsCategory } from './Categories/Actions'
import { AppearanceCategory } from './Categories/Appearance'
import { Category } from './Categories/Category'
import { EditorCategory } from './Categories/Editor'
import { GeneralCategory } from './Categories/General'
import { ProjectsCategory } from './Categories/Projects'

export class Settings {
	public categories: Category[] = []

	constructor() {
		this.addCategory(new GeneralCategory())
		this.addCategory(new EditorCategory())
		this.addCategory(new AppearanceCategory())
		this.addCategory(new ProjectsCategory())
		this.addCategory(new ActionsCategory())
	}

	public addCategory(category: Category) {
		this.categories.push(category)
	}
}
