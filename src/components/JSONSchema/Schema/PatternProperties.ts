import { RootSchema } from './Root'
import { IDiagnostic, Schema } from './Schema'

export class PatternPropertiesSchema extends Schema {
	protected children: Record<string, Schema> = {}

	get types() {
		return [<const>'object']
	}

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

	getSchemasFor(obj: unknown, location: (string | number | undefined)[]) {
		const key = location.shift()

		let schemas: Schema[] = []
		if (typeof key === 'number' || key === undefined) return schemas
		if (Array.isArray((<any>obj)[key])) return []

		for (const [pattern, child] of Object.entries(this.children)) {
			if (key.match(new RegExp(pattern)) !== null) schemas.push(child)
		}

		return location.length === 0
			? schemas
			: schemas
					.map((schema) =>
						schema.getSchemasFor((<any>obj)[key], [...location])
					)
					.flat()
	}

	getCompletionItems() {
		return []
	}

	validate(obj: unknown) {
		if (typeof obj !== 'object' || Array.isArray(obj))
			return [
				<const>{
					severity: 'warning',
					message: `This node is of type ${
						Array.isArray(obj) ? 'array' : typeof obj
					}; expected object`,
				},
			]

		return []
	}
	isValid(obj: unknown) {
		const isOwnValid = super.isValid(obj)
		if (!isOwnValid) return false

		for (const [pattern, child] of Object.entries(this.children)) {
			const regExp = new RegExp(pattern)

			for (const key in <any>obj) {
				if (key.match(regExp) !== null) {
					if (!child.isValid((<any>obj)[key])) return false
				}
			}

			regExp.lastIndex = 0
		}

		return true
	}
}
