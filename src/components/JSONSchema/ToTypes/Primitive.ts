import { Type } from './Type'

export type TSupportedPrimitiveTypes = 'string' | 'number' | 'boolean' | 'null'

export class PrimitiveType extends Type {
	constructor(protected primitiveType: TSupportedPrimitiveTypes) {
		super()
	}

	static toTypeScriptType(
		jsonSchemaType: 'boolean' | 'string' | 'decimal' | 'integer' | 'null'
	) {
		if ((jsonSchemaType === 'decimal') | (type === 'integer'))
			return 'number'

		return jsonSchemaType
	}

	public toString() {
		return this.primitiveType
	}
}
