import { InterfaceType } from './Interface'
import { BaseType } from './Type'

export abstract class CombinedType extends BaseType {
	constructor(private types: BaseType[], protected joinChar: string) {
		super()
	}

	protected abstract isOfThisType(type: CombinedType): boolean

	add(baseType: BaseType) {
		this.types.push(baseType)
	}

	protected flatten(): BaseType[] {
		return this.types
			.map((type) => {
				if (type instanceof CombinedType) {
					const flat = type.flatten()

					if (flat.length === 0) return []
					else if (flat.length === 1) return flat[0]
					else if (this.isOfThisType(type)) return flat

					return type
				} else return type
			})
			.flat(1)
	}

	protected withCollapsedInterfaces() {
		const types = this.flatten()
		const interfaceType = new InterfaceType()

		const newTypes: BaseType[] = []
		let foundInterface = false
		for (const type of types) {
			if (type instanceof InterfaceType) {
				interfaceType.addFrom(type)
				foundInterface = true
			} else {
				newTypes.push(type)
			}
		}

		return foundInterface ? newTypes.concat(interfaceType) : newTypes
	}

	isStringCollection(collection: string[]) {
		return collection.every(
			(type) =>
				(type.startsWith("'") && type.endsWith("'")) ||
				type === 'string'
		)
	}

	toString() {
		let collection = [
			...new Set(
				this.withCollapsedInterfaces().map((type) => type.toString())
			),
		]

		if (this.isStringCollection(collection))
			collection = collection.filter((type) => type !== 'string')

		if (collection.length === 1) return collection[0]

		return `(${collection.join(this.joinChar)})`
	}
}
