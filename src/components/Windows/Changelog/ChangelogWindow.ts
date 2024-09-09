import { Window } from '../Window'
import Changelog from './Changelog.vue'

/**
 * @description A changelog window.
 */
export class ChangelogWindow extends Window {
	/**
	 * @description The id of the window.
	 */
	public static id = 'createProject'
	/**
	 * @description The vue component used to display the window.
	 */
	public static component = Changelog
}
