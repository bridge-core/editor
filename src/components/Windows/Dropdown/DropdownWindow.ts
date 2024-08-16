import { Window } from '../Window'
import { Ref, ref } from 'vue'
import Dropdown from './Dropdown.vue'

export class DropdownWindow extends Window {
	public id = 'dropwdownWindow'
	public component = Dropdown

	public name: Ref<string> = ref('?')

	constructor(
		name: string,
		public label: string,
		public options: string[],
		public confirmCallback: (input: string) => void,
		public cancelCallback: () => void = () => {},
		public defaultValue?: string
	) {
		super()

		this.name.value = name
	}

	public confirm(input: string) {
		this.confirmCallback(input)
	}

	public cancel() {
		this.cancelCallback()
	}
}
