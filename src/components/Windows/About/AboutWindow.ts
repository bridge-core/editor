import { Window } from '../Window'
import About from './About.vue'

export class AboutWindow extends Window {
	public static id = 'createProject'
	public static component = About
}
