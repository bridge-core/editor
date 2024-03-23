import { Window } from '../Window'
import { Windows } from '../Windows'
import Changelog from './Changelog.vue'

export class ChangelogWindow extends Window {
	public static id = 'createProject'
	public static component = Changelog
}
