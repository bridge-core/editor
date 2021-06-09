import { IfSchema } from './IfSchema'
import { RootSchema } from './Root'
import { Schema } from './Schema'

export class ThenSchema extends Schema {
	protected ifSchema!: IfSchema
	protected rootSchema!: RootSchema

	constructor(location: string, key: string, value: unknown) {
		super(location, key, value)

		this.rootSchema = new RootSchema(this.location, 'then', value)
	}

	receiveIfSchema(ifSchema: IfSchema) {
		this.ifSchema = ifSchema
	}

	getSchemasFor(location: (string | number)[]) {
		return this.rootSchema.getSchemasFor([...location])
	}

	getCompletionItems(obj: unknown) {
		if (this.ifSchema.isTrue(obj))
			return this.rootSchema.getCompletionItems(obj)
		return []
	}

	validate(obj: unknown) {
		if (this.ifSchema.isTrue(obj)) return this.rootSchema.validate(obj)
		return []
	}
}
