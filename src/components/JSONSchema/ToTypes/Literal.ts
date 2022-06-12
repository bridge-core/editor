import { BaseType } from './Type'

export class LiteralType extends BaseType {
	constructor(protected literalType: string | number | boolean) {
		super()
	}

	public toString() {
		if (typeof this.literalType === 'string') return `'${this.literalType}'`
		return `${this.literalType}`
	}
}
