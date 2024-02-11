import { get, set } from 'idb-keyval'
import OutputFolder from '../OutputFolder.vue'
import { Category } from './Category'
import { fileSystem, settings } from '@/App'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'

export class ProjectsCategory extends Category {
	public name = 'windows.settings.projects.name'
	public id = 'projects'
	public icon = 'folder'

	constructor() {
		super()

		if (fileSystem instanceof PWAFileSystem) {
			this.addCustom(OutputFolder, 'outputFolder')

			this.addSetting(
				'outputFolder',
				undefined,
				'windows.settings.projects.outputFolder.name',
				'windows.settings.projects.outputFolder.description',
				undefined,
				async (value) => await set('defaultOutputFolder', value),
				async () => await get('defaultOutputFolder')
			)

			this.addButton(
				'clearOutputFolder',
				'windows.settings.projects.clearOutputFolder.name',
				'windows.settings.projects.clearOutputFolder.description',
				() => {
					settings.set('outputFolder', undefined)
				}
			)
		}
	}
}
