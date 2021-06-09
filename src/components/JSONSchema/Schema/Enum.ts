import { Schema } from './Schema'

export class EnumSchema extends Schema {
	constructor(location: string, key: string, value: unknown) {
		super(location, key, value)

		if (!Array.isArray(value))
			throw new Error(`Enum must be of type array; found ${typeof value}`)
	}

	getSchemasFor() {
		return []
	}

	getCompletionItems() {
		return (<unknown[]>this.value).map(
			(value) => <const>{ type: 'value', value }
		)
	}

	validate(val: unknown) {
		if (!(<unknown[]>this.value).includes(val))
			return [
				{
					message: `Found ${val}; expected one of ${(<unknown[]>(
						this.value
					)).join(', ')}`,
				},
			]
		return []
	}
}
