import { IfSchema } from './IfSchema'
import { RootSchema } from './Root'
import { Schema } from './Schema'

export class ThenSchema extends Schema {
	protected ifSchema!: IfSchema
	protected rootSchema!: RootSchema

	get types() {
		if (this.ifSchema.isTrue(this.value)) return this.rootSchema.types
		return []
	}

	constructor(location: string, key: string, value: unknown) {
		super(location, key, value)

		this.rootSchema = new RootSchema(this.location, 'then', value)
	}

	receiveIfSchema(ifSchema: IfSchema) {
		this.ifSchema = ifSchema
	}

	getSchemasFor(obj: unknown, location: (string | number)[]) {
		if (this.ifSchema.isTrue(obj))
			return this.rootSchema.getSchemasFor(obj, [...location])
		return []
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
