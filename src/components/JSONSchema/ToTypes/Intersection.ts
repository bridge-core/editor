import { BaseType } from './Type'
import { CombinedType } from './CombinedType'

export class IntersectionType extends CombinedType {
	constructor(types: BaseType[]) {
		super(types, ' & ')
	}

	isOfThisType(type: CombinedType) {
		return type instanceof IntersectionType
	}
}
