import { CombinedType } from './CombinedType'
import { BaseType } from './Type'
import { UnionType } from './Union'

export class InterfaceType extends BaseType {
	protected properties: Record<string, BaseType> = {}

	addProperty(name: string, type: BaseType) {
		this.properties[name] = type
	}
	addFrom(interfaceType: InterfaceType) {
		for (const [key, type] of Object.entries(interfaceType.properties)) {
			const existingType = this.properties[key]
			if(existingType instanceof CombinedType) {
				existingType.add(type)
			} else if(existingType) {
				this.addProperty(key, new UnionType([this.properties[key], type]))
			} else {
				this.addProperty(key, type)
			}
		}
	}

	toString() {
		return `{ ${Object.entries(this.properties)
			.map(([key, type]) => `${key}?: ${type.toString()}`)
			.join(';')};[k: string]: unknown; }`
	}

	override withName(name: string) {
		return `interface ${name} ${this.toString()};`
	}
}