import { Type } from '../ToTypes/Type'

export class UnionType extends Type {
	constructor(protected types: Type[]) {}

	toString() {
		return this.types.map((type) => type.toString()).join(' | ')
	}
}
