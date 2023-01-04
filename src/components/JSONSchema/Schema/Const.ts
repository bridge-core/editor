import { Schema } from './Schema'

export class ConstSchema extends Schema {
	public readonly types = []
	getSchemasFor() {
		return []
	}

	getCompletionItems() {
		return [
			<const>{ type: 'value', label: `${this.value}`, value: this.value },
		]
	}

	validate(val: unknown) {
		if (this.value !== val)
			return [
				<const>{
					severity: 'warning',
					message: `Found "${val}" here; expected "${this.value}"`,
				},
			]
		return []
	}
}
