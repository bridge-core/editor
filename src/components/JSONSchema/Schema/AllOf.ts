import { ParentSchema } from './Parent'
import { RootSchema } from './Root'
import { Schema } from './Schema'

export class AllOfSchema extends ParentSchema {
	protected children: Schema[]

	constructor(location: string, key: string, value: unknown) {
		super(location, key, value)

		if (!Array.isArray(value))
			throw new Error(
				`"allOf" schema must be of type array, found "${typeof value}"`
			)

		this.children = value.map(
			(val) => new RootSchema(this.location, 'allOf', val)
		)
	}

	validate(obj: unknown) {
		const allDiagnostics = this.children
			.map((child) => child.validate(obj))
			.flat()

		if (allDiagnostics.length === 0) return []
		return allDiagnostics
	}
	isValid(obj: unknown) {
		return this.children.every((child) => child.isValid(obj))
	}
}
