import { RootSchema } from './Root'
import { Schema } from './Schema'

export class IfSchema extends Schema {
	public readonly type = 'ifSchema'
	protected rootSchema?: RootSchema

	constructor(location: string, key: string, value: unknown) {
		super(location, key, value)

		if (typeof value !== 'boolean')
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
		if (typeof this.value === 'boolean') return this.value

		return this.rootSchema?.isValid(obj)
	}
}
