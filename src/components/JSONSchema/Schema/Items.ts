import { RootSchema } from './Root'
import { IDiagnostic, Schema } from './Schema'

export class ItemsSchema extends Schema {
	protected children: RootSchema | RootSchema[]

	get types() {
		return [<const>'array']
	}

	constructor(location: string, key: string, value: unknown) {
		super(location, key, value)

		if (typeof value !== 'object' && typeof value !== 'undefined')
			throw new Error(
				`Invalid usage of "properties" schema field. Expected type "object", received "${typeof value}"`
			)

		if (Array.isArray(value))
			this.children = value.map(
				(val) => new RootSchema(this.location, 'items', val)
			)
		else this.children = new RootSchema(this.location, 'items', value)
	}

	get arrayChildren() {
		return Array.isArray(this.children) ? this.children : [this.children]
	}

	getSchemasFor(obj: unknown, location: (string | number | undefined)[]) {
		const key = location.shift()

		if (typeof key === 'string') return []
		else if (key === undefined) return this.arrayChildren
		else if (location.length === 0) {
			if (Array.isArray(this.children))
				return this.children[key] ? [this.children[key]] : []
			else return [this.children]
		}

		if (Array.isArray(this.children))
			return (
				this.children[key]?.getSchemasFor((<any>obj)[key], [
					...location,
				]) ?? []
			)
		else return this.children.getSchemasFor((<any>obj)[key], [...location])
	}

	getCompletionItems(obj: unknown) {
		return this.arrayChildren
			.filter((child) => !child.hasDoNotSuggest)
			.map((child) => child.getCompletionItems(obj))
			.flat()
	}

	// TODO: Implement proper item validation
	validate(obj: unknown) {
		return []
	}
}
