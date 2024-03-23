import { Windows } from '../Windows'
import { Window } from '../Window'
import { Ref, ref } from 'vue'
import Prompt from './Prompt.vue'

export class PromptWindow extends Window {
	public id = 'promptWindow'
	public component = Prompt

	public static name: Ref<string> = ref('?')
	public static label: string = '?'
	public static placeholder: string = '?'

	private static confirmCallback: (input: string) => void = () => {}
	private static cancelCallback: () => void = () => {}

	public static open(
		name: string,
		label: string,
		placeholder: string,
		confirmCallback: (input: string) => void,
		cancelCallback: () => void = () => {}
	) {
		this.name.value = name
		this.label = label
		this.placeholder = placeholder
		this.confirmCallback = confirmCallback
		this.cancelCallback = cancelCallback

		Windows.open(new PromptWindow())
	}

	public static confirm(input: string) {
		this.confirmCallback(input)
	}

	public static cancel() {
		this.cancelCallback()
	}
}
