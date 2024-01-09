import { get, set } from 'idb-keyval'
import OutputFolder from '../OutputFolder.vue'
import { Category } from './Category'

export class ProjectsCategory extends Category {
	public name = 'Projects'
	public id = 'projects'
	public icon = 'folder'

	constructor() {
		super()

		this.addCustom(
			OutputFolder,
			'outputFolder',
			undefined,
			'Output Folder',
			'Default Compile Location For Projects',
			(value) => {
				console.log('Output Folder', value)
			},
			async () => await get('defaultOutputFolder'),
			(value) => set('defaultOutputFolder', value)
		)
	}
}
