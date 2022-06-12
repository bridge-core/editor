import { Type } from './Type'

export class ArrayType extends Type {
	constructor(public readonly type: Type) {
		super()
	}

	public toString() {
		return `${this.type.toString()}[]`
	}
}
