import { BaseType } from '../ToTypes/Type'
import { UnionType } from '../ToTypes/Union'
import { DoNotSuggestSchema } from './DoNotSuggest'
import { Schema } from './Schema'

export abstract class ParentSchema extends Schema {
	protected abstract children: Schema[]

	get types() {
		return this.children.map((child) => child.types).flat()
	}

	get hasDoNotSuggest() {
		return this.children.some(
			(child) => child instanceof DoNotSuggestSchema
		)
	}

	getCompletionItems(obj: unknown) {
		if (this.hasDoNotSuggest) return []

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
		if(this.hasDoNotSuggest) console.warn(`[${this.location}] Called Schema.toTypeDefinition on a schema which has "doNotSuggest"`)

		return new UnionType(
			<BaseType[]>(this.children
				.map((child) => child.toTypeDefinition(hoisted))
				.filter((schema) => schema !== null))
		)
	}
}
