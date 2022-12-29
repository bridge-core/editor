import { ParentSchema } from './Parent'
import { RootSchema } from './Root'
import { IDiagnostic, Schema } from './Schema'

export class OneOfSchema extends ParentSchema {
	protected children: Schema[]

	constructor(location: string, key: string, value: unknown) {
		super(location, key, value)

		if (!Array.isArray(value))
			throw new Error(
				`"oneOf" schema must be of type array, found "${typeof value}"`
			)

		this.children = value.map(
			(val) => new RootSchema(this.location, 'oneOf', val)
		)
	}

	validate(obj: unknown) {
		const allDiagnostics: IDiagnostic[] = []
		let matchedOne = false
		let hasTooManyMatches = false

		for (const child of this.children) {
			const diagnostics = child.validate(obj)

			if (diagnostics.length === 0) {
				if (matchedOne) hasTooManyMatches = true
				matchedOne = true
			}

			allDiagnostics.push(...diagnostics)
		}

		if (hasTooManyMatches)
			return [
				<const>{
					severity: 'warning',
					message: `JSON matched more than one schema, expected exactly one match`,
				},
			]
		else if (matchedOne) return []
		else
			return [
				<const>{
					severity: 'warning',
					message: `JSON did not match any schema, expected exactly one match`,
				},
			]
	}
}
