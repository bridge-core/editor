import { ParentSchema } from './Parent'
import { RootSchema } from './Root'
import { IDiagnostic, Schema } from './Schema'

export class AnyOfSchema extends ParentSchema {
	protected children: Schema[]

	constructor(location: string, key: string, value: unknown) {
		super(location, key, value)

		if (!Array.isArray(value))
			throw new Error(
				`"anyOf" schema must be of type array, found "${typeof value}"`
			)

		this.children = value.map(
			(val) => new RootSchema(this.location, 'anyOf', val)
		)
	}

	validate(obj: unknown) {
		const allDiagnostics: IDiagnostic[] = []

		for (const child of this.children) {
			const diagnostics = child.validate(obj)

			if (diagnostics.length === 0) return []

			allDiagnostics.push(...diagnostics)
		}

		return allDiagnostics
	}
}
