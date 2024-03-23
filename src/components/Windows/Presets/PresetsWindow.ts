import { Window } from '../Window'
import Presets from './Presets.vue'

export class PresetsWindow extends Window {
	public static id = 'presets'
	public static component = Presets
}
