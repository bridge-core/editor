import { RootSchema } from './Root'
import { Schema } from './Schema'

export class AdditionalPropertiesSchema extends Schema {
	protected rootSchema?: RootSchema

	public readonly types = []

	constructor(location: string, key: string, value: unknown) {
		super(location, key, value)

		if (typeof value === 'object')
			this.rootSchema = new RootSchema(location, key, value)
	}

	validate(obj: unknown) {
		return this.rootSchema?.validate(obj) ?? []
	}

	getCompletionItems(obj: unknown) {
		return []
	}
	getSchemasFor(obj: any, location: (string | number | undefined)[]) {
		if (location.length === 0) return []
		else if (location.length === 1)
			return this.rootSchema ? [this.rootSchema] : []
		const key = location.shift()!
		if (Array.isArray(obj[key])) return []

		return this.rootSchema?.getSchemasFor(obj[key], location) ?? []
	}
}
