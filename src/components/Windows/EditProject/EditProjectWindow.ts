import { Window } from '../Window'
import { Windows } from '../Windows'
import EditProject from './EditProject.vue'
import { ProjectInfo } from '@/libs/project/ProjectManager'

export class EditProjectWindow extends Window {
	public static id = 'editProject'
	public static component = EditProject

	public static projectInfo: ProjectInfo

	public static open(projectInfo: ProjectInfo) {
		this.projectInfo = projectInfo

		Windows.open(this)
	}
}
