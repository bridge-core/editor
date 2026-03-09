import { Window } from '../Window'
import Presets from './Presets.vue'

export class PresetsWindow extends Window {
	public static id = 'presets'
	public static component = Presets

	public static validationRules: Record<string, (value: string) => string | null> = {
		alphanumeric: (value) => (value.match(/^[a-zA-Z0-9_\.]*$/) !== null ? null : 'validation.invalidLetters'),
		lowercase: (value: string) => (value.toLowerCase() === value ? null : 'validation.mustBeLowercase'),
		required: (value: string) => (!!value ? null : 'validation.mustNotBeEmpty'),
		numeric: (value: string) => (!isNaN(Number(value)) ? null : 'validation.mustBeNumeric'),
	}
}
