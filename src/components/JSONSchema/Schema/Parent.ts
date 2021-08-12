import { Schema } from './Schema'

export abstract class ParentSchema extends Schema {
	protected abstract children: Schema[]

	getCompletionItems(obj: unknown) {
		return this.children
			.map((child) => child.getCompletionItems(obj))
			.flat()
	}

	getSchemasFor(obj: unknown, location: (string | number)[]) {
		return this.children
			.map((child) => child.getSchemasFor(obj, [...location]))
			.flat()
	}
}
