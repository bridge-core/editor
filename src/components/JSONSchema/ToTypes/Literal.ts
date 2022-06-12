import { Type } from './Type'

export class LiteralType extends Type {
	constructor(protected literalType: string | number | boolean) {
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
		if (typeof this.literalType === 'string') return `'${this.literalType}'`
		return this.literalType
	}
}
