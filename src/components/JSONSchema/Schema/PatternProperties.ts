import { RootSchema } from './Root'
import { IDiagnostic, Schema } from './Schema'

export class PatternPropertiesSchema extends Schema {
	protected children: Record<string, Schema> = {}

	constructor(location: string, key: string, value: unknown) {
		super(location, key, value)

		if (typeof value !== 'object' && typeof value !== 'undefined')
			throw new Error(
				`Invalid usage of "properties" schema field. Expected type "object", received "${typeof value}"`
			)

		this.children = Object.fromEntries(
			Object.entries(value ?? {}).map(([key, val]) => [
				key,
				new RootSchema(this.location, key, val),
			])
		)
	}

	getSchemasFor(location: (string | number)[]) {
		const key = location.shift()
		let schemas: Schema[] = []
		if (typeof key === 'number' || key === undefined) return schemas

		for (const [pattern, child] of Object.entries(this.children)) {
			if (key.match(new RegExp(pattern)) !== null) schemas.push(child)
		}

		return location.length === 0
			? schemas
			: schemas
					.map((schema) => schema.getSchemasFor([...location]))
					.flat()
	}

	getCompletionItems() {
		return []
	}

	validate(obj: unknown) {
		if (typeof obj !== 'object' || Array.isArray(obj))
			return [
				{
					message: `Invalid type: Expected "object", received "${
						Array.isArray(obj) ? 'array' : typeof obj
					}"`,
				},
			]

		const diagnostics: IDiagnostic[] = []

		for (const key in obj) {
			for (const [pattern, child] of Object.entries(this.children)) {
				if (key.match(new RegExp(pattern)) === null) {
					diagnostics.push(...child.validate((<any>obj)[key]))
				}
			}
		}

		return diagnostics
	}
}
