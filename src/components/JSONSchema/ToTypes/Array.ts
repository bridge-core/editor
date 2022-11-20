import { BaseType } from './Type'

export class ArrayType extends BaseType {
	constructor(public readonly type: BaseType) {
		super()
	}

	public toString() {
		return `${this.type.toString()}[]`
	}
}
