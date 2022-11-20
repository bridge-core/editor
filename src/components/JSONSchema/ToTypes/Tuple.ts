import { BaseType } from './Type'

export class TupleType extends BaseType {
	constructor(public readonly types: BaseType[]) {
		super()
	}

	public toString() {
		return `[${this.types.map((type) => type.toString()).join(', ')}]`
	}
}
