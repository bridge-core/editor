import { Schema } from './Schema'
import { getTypeOf } from '/@/utils/typeof'

export class TypeSchema extends Schema {
	getSchemasFor() {
		return []
	}

	getCompletionItems() {
		return []
	}

	validate(val: unknown) {
		const values = Array.isArray(this.value) ? this.value : [this.value]

		if (!values.includes(getTypeOf(val)))
			return [
				{
					message: `Invalid type: Found ${getTypeOf(
						val
					)}; expected ${values.join(', ')}`,
				},
			]

		return []
	}
}
