import { ICompletionItem, Schema } from './Schema'
import { getTypeOf } from '/@/utils/typeof'

export class TypeSchema extends Schema {
	get values() {
		return Array.isArray(this.value) ? this.value : [this.value]
	}

	getSchemasFor() {
		return []
	}

	getCompletionItems() {
		const suggestions: ICompletionItem[] = []
		if (this.values.includes('boolean'))
			suggestions.push(
				...['true', 'false'].map(
					(value) => <const>{ type: 'value', value }
				)
			)

		return suggestions
	}

	validate(val: unknown) {
		const values = Array.isArray(this.value) ? this.value : [this.value]

		if (!values.includes(getTypeOf(val)))
			return [
				{
					message: `Invalid type: Found ${getTypeOf(
						val
					)}; expected ${values.join(', ')}`,
				},
			]

		return []
	}
}
