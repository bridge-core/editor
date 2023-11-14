import { Schema } from './Schema'
import { closestMatch } from '/@/libs/string/closestMatch'

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
						priority: 0,
						severity: 'warning',
						message: `Found "${val}"; but no values are valid`,
					},
				]
			}

			// console.log(<unknown[]>this.value)
			const bestMatch = closestMatch(
				`${val}`,
				values.map((v) => `${v}`),
				0.6
			)
			return [
				<const>{
					priority: 1,
					severity: 'warning',
					message: bestMatch
						? `"${val}" not valid here. Did you mean "${bestMatch}"?`
						: `"${val}" not valid here`,
				},
			]
		}
		return []
	}
}
