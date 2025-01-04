import { Settings } from '@/libs/settings/Settings'
import { Window } from '../Window'
import CreateProject from './CreateProject.vue'

export class CreateProjectWindow extends Window {
	public static id = 'createProject'
	public static component = CreateProject

	public static setup() {
		Settings.addSetting('defaultAuthor', {
			default: '',
		})
	}
}
