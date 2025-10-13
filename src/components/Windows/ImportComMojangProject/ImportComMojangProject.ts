import { Settings } from '@/libs/settings/Settings'
import { Window } from '../Window'
import CreateProject from './ImportComMojangProject.vue'

export class ImportComMojangProject extends Window {
	public static id = 'importComMojangProject'
	public static component = CreateProject
}
