import { Type } from './Type'

export class Tuple extends Type {
	constructor(public readonly types: Type[]) {
		super()
	}

	public toString() {
		return `[${this.types.map((type) => type.toString()).join(', ')}]`
	}
}
