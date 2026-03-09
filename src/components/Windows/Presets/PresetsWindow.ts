import { Window } from '../Window'
import Presets from './Presets.vue'

export class PresetsWindow extends Window {
	public static id = 'presets'
	public static component = Presets

	public static validationRules: Record<string, (value: string) => string | null> = {
		alphanumeric: (value) => (value.match(/^[a-zA-Z0-9_\.]*$/) !== null ? null : 'invalid characters!'),
		lowercase: (value: string) => (value.toLowerCase() === value ? null : 'must be lowcase'),
		required: (value: string) => (!!value ? null : 'value required'),
		numeric: (value: string) => (!isNaN(Number(value)) ? null : 'must be number'),
	}
}
