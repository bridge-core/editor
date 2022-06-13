import { BaseType } from '../ToTypes/Type'
import { UnionType } from '../ToTypes/Union'
import { Schema } from './Schema'

export abstract class ParentSchema extends Schema {
	protected abstract children: Schema[]

	get types() {
		return this.children.map((child) => child.types).flat()
	}

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

	getFlatChildren() {
		const children: Schema[] = []

		for (const child of this.children) {
			if (child instanceof ParentSchema)
				children.push(...child.getFlatChildren())
			else children.push(child)
		}

		return children
	}

	override toTypeDefinition(hoisted: Set<Schema>) {
		return new UnionType(
			<BaseType[]>(this.children
				.map((child) => child.toTypeDefinition(hoisted))
				.filter((schema) => schema !== null))
		)
	}
}
