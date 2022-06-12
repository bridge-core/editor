import { Type } from './Type'

export class Interface extends Type {
	protected properties: Record<string, Type> = {}

	addProperty(name: string, type: Type) {
		this.properties[name] = type
	}

	toString() {
		return `{
            ${Object.entries(this.properties)
				.map(([key, type]) => `\t${key}: ${type.toString()}`)
				.join('\n')}
            [k: string]: any
        }`
	}
}
