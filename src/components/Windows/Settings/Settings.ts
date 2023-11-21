import { ActionsCategory } from './Categories/Actions'
import { AppearanceCategory } from './Categories/Appearance'
import { Category } from './Categories/Category'
import { EditorCategory } from './Categories/Editor'
import { GeneralCategory } from './Categories/General'
import { ProjectsCategory } from './Categories/Projects'
import { LocalFileSystem } from '/@/libs/fileSystem/LocalFileSystem'

export class Settings {
	public categories: Category[] = []
	public settings: any = null

	private fileSystem: LocalFileSystem = new LocalFileSystem()

	constructor() {
		this.fileSystem.setRootName('settings')

		this.addCategory(new GeneralCategory())
		this.addCategory(new EditorCategory())
		this.addCategory(new AppearanceCategory())
		this.addCategory(new ProjectsCategory())
		this.addCategory(new ActionsCategory())
	}

	public async load() {
		if (!(await this.fileSystem.exists('settings.json'))) {
			this.settings = {}

			return
		}

		this.settings = await this.fileSystem.readFileJson('settings.json')
	}

	public addCategory(category: Category) {
		this.categories.push(category)
	}

	public get(id: string, defaultValue?: any) {
		if (!this.settings) return defaultValue

		return this.settings[id] ?? defaultValue
	}
}
