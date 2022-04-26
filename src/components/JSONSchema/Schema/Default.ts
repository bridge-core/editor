import { Schema } from './Schema'

export class DefaultSchema extends Schema {
	public readonly types = []
	getSchemasFor() {
		return []
	}

	getCompletionItems() {
		// TODO - Support object and array values
		if (typeof this.value !== 'object' && !Array.isArray(this.value))
			return [
				<const>{
					type: 'value',
					label: `${this.value}`,
					value: this.value,
				},
			]
		else return []
	}
}
