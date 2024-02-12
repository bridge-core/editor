import { windows } from '@/App'
import { Ref, ref } from 'vue'

export class PromptWindow {
	public name: Ref<string> = ref('?')
	public label: string = '?'
	public placeholder: string = '?'

	private confirmCallback: (input: string) => void = () => {}
	private cancelCallback: () => void = () => {}

	public open(
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

		windows.open('prompt')
	}

	public confirm(input: string) {
		this.confirmCallback(input)
	}

	public cancel() {
		this.cancelCallback()
	}
}
