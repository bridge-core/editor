import { Window } from '../Window'
import CreateProject from './CreateProject.vue'

export class CreateProjectWindow extends Window {
	public static id = 'createProject'
	public static component = CreateProject
}
