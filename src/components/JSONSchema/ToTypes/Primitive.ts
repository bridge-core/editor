import { Type } from './Type'

export class PrimitiveType extends Type {
	constructor(
		protected primitiveType: 'string' | 'number' | 'boolean' | 'null'
	) {
		super()
	}

	public toString() {
		return this.primitiveType
	}
}
