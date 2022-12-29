import { Schema } from './Schema'

export class EnumSchema extends Schema {
	public readonly types = []

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
			(value) => <const>{ type: 'value', label: `${value}`, value }
		)
	}

	validate(val: unknown) {
		const values = <unknown[]>this.value
		if (!values.includes(val)) {
			if (values.length === 0) {
				return [
					<const>{
						severity: 'warning',
						message: `Found "${val}"; but no values are valid`,
					},
				]
			}

			// console.log(<unknown[]>this.value)
			return [
				<const>{
					severity: 'warning',
					message: `Found "${val}"; expected one of ${values
						.map((v) => `"${v}"`)
						.join(', ')}`,
				},
			]
		}
		return []
	}
}
