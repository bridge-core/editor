import { Window } from '../Window'
import EditProject from './EditProject.vue'
import { ProjectInfo } from '@/libs/project/ProjectManager'

export class EditProjectWindow extends Window {
	public static id = 'editProject'
	public component = EditProject

	constructor(public projectInfo: ProjectInfo) {
		super()
	}
}
