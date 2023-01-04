import { RootSchema } from './Root'
import { Schema } from './Schema'

export class NotSchema extends Schema {
	protected rootSchema: RootSchema
	public readonly types = []

	constructor(location: string, key: string, value: unknown) {
		super(location, key, value)

		if (typeof value !== 'object') {
			throw new Error(
				`[${location}] Type of "not" must be object, found ${typeof value}`
			)
		}

		this.rootSchema = new RootSchema(this.location, 'not', value)
	}

	getSchemasFor() {
		return []
	}

	getCompletionItems() {
		return []
	}

	validate(obj: unknown) {
		if (this.rootSchema.isValid(obj)) {
			return [
				<const>{
					severity: 'warning',
					message: 'Expected schema to be invalid',
				},
			]
		}

		return []
	}

	isValid(obj: unknown) {
		return !this.rootSchema.isValid(obj)
	}
}
