import { SchemaManager } from '../Manager'
import { IfSchema } from './IfSchema'
import { ParentSchema } from './Parent'
import { Schema } from './Schema'
import { ThenSchema } from './ThenSchema'

export class RootSchema extends ParentSchema {
	protected children!: Schema[]

	constructor(location: string, key: string, value: unknown) {
		super(location, key, value)

		if (key === '$global' || key === '$ref')
			SchemaManager.addRootSchema(location, this)

		this.children = SchemaManager.createSchemas(this.location, value)
		// console.log(this.children)
	}

	validate(obj: unknown) {
		return this.children.map((child) => child.validate(obj)).flat()
	}

	getFreeIfSchema(): IfSchema | undefined {
		let isIfOccupied = false
		for (const child of this.getFlatChildren().reverse()) {
			if (child instanceof ThenSchema) {
				isIfOccupied = true
			} else if (child instanceof IfSchema) {
				if (isIfOccupied) isIfOccupied = false
				else return child
			}
		}
	}
}
