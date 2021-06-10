import { SchemaManager } from '../Manager'
import { ParentSchema } from './Parent'
import { Schema } from './Schema'

export class RootSchema extends ParentSchema {
	protected children!: Schema[]

	constructor(location: string, key: string, value: unknown) {
		super(location, key, value)

		if (key === '$global' || key === '$ref')
			SchemaManager.addRootSchema(location, this)

		this.children = SchemaManager.createSchemas(this.location, value)
	}

	validate(obj: unknown) {
		return this.children.map((child) => child.validate(obj)).flat()
	}
}
