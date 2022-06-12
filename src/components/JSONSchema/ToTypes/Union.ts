import { BaseType } from '../ToTypes/Type'

export class UnionType extends BaseType {
	constructor(public readonly types: BaseType[]) {
		super()
	}

	flat(): BaseType[] {
		return this.types
			.map((type) => (type instanceof UnionType ? type.flat() : type))
			.flat(Infinity)
	}

	toString() {
		return [...new Set(this.flat().map((type) => type.toString()))].join(
			' | '
		)
	}
}
