import { ParentSchema } from './Parent'
import { RootSchema } from './Root'
import { Schema } from './Schema'
import { UnionType } from '../ToTypes/Union'

export class AllOfSchema extends ParentSchema {
	protected children: Schema[]

	constructor(location: string, key: string, value: unknown) {
		super(location, key, value)

		if (!Array.isArray(value))
			throw new Error(
				`"allOf" schema must be of type array, found "${typeof value}"`
			)

		this.children = value.map(
			(val) => new RootSchema(this.location, 'allOf', val)
		)
	}

	validate(obj: unknown) {
		return this.children.map((child) => child.validate(obj)).flat()
	}
}
