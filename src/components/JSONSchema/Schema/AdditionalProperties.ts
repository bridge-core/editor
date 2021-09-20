import { RootSchema } from './Root'
import { Schema } from './Schema'

export class AdditionalPropertiesSchema extends Schema {
	protected rootSchema?: RootSchema

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
	getSchemasFor(obj: any, location: (string | number)[]) {
		if (location.length === 0) return []
		else if (location.length === 1)
			return this.rootSchema ? [this.rootSchema] : []
		const key = location.shift()!

		return this.rootSchema?.getSchemasFor(obj[key], location) ?? []
	}
}
