import { ICompletionItem, Schema } from './Schema'
import { getTypeOf } from '/@/utils/typeof'

export class TypeSchema extends Schema {
	get values() {
		return Array.isArray(this.value) ? this.value : [this.value]
	}
	get types() {
		return this.values
	}

	getSchemasFor() {
		return []
	}

	getCompletionItems() {
		const suggestions: ICompletionItem[] = []
		if (this.values.includes('boolean'))
			suggestions.push(
				...[true, false].map(
					(value) =>
						<const>{ type: 'value', label: `${value}`, value }
				)
			)
		if (this.values.includes('integer'))
			suggestions.push(
				...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(
					(value) =>
						<const>{ type: 'value', label: `${value}`, value }
				)
			)
		if (this.values.includes('number'))
			suggestions.push(
				...[0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(
					(value) =>
						<const>{ type: 'value', label: `${value}`, value }
				)
			)
		if (this.values.includes('null'))
			suggestions.push(<const>{
				type: 'value',
				label: 'null',
				value: null,
			})

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
