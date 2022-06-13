import { BaseType } from '../ToTypes/Type'
import { CombinedType } from './CombinedType'

export class UnionType extends CombinedType {
	constructor(types: BaseType[]) {
		super(types, ' | ')
	}

	isOfThisType(type: CombinedType) {
		return type instanceof UnionType
	}
}
