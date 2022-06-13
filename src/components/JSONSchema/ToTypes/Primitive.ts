import { BaseType } from './Type'

export type TSupportedPrimitiveTypes = 'string' | 'number' | 'boolean' | 'null'

export class PrimitiveType extends BaseType {
	constructor(protected primitiveType: TSupportedPrimitiveTypes | string) {
		super()
	}

	static toTypeScriptType(
		jsonSchemaType: 'boolean' | 'string' | 'decimal' | 'integer' | 'null'
	) {
		if (jsonSchemaType === 'decimal' || jsonSchemaType === 'integer')
			return 'number'

		return jsonSchemaType
	}

	public toString() {
		return this.primitiveType
	}
}
