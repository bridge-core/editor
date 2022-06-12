import { BaseType } from './Type'

export class InterfaceType extends BaseType {
	protected properties: Record<string, BaseType> = {}

	addProperty(name: string, type: BaseType) {
		this.properties[name] = type
	}

	toString() {
		return `{ ${Object.entries(this.properties)
			.map(([key, type]) => `${key}?: ${type.toString()}`)
			.join(';')}; }`
	}
}
