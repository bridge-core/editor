import { RootSchema } from './Root'
import { Schema } from './Schema'

export class IfSchema extends Schema {
	protected rootSchema: RootSchema

	constructor(location: string, key: string, value: unknown) {
		super(location, key, value)

		this.rootSchema = new RootSchema(this.location, 'if', value)
	}

	getSchemasFor() {
		return []
	}

	getCompletionItems() {
		return []
	}

	validate() {
		return []
	}

	isTrue(obj: unknown) {
		return this.rootSchema.isValid(obj)
	}
}
