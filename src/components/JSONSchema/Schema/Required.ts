import { Schema } from './Schema'

export class RequiredSchema extends Schema {
	public readonly types = []

	getSchemasFor() {
		return []
	}

	getCompletionItems() {
		return []
	}

	validate(obj: unknown) {
		const values = Array.isArray(this.value) ? this.value : [this.value]

		if (typeof obj !== 'object' || Array.isArray(obj))
			return [
				{
					message: `Required properties missing: ${values.join(
						', '
					)}`,
				},
			]

		for (const value of values) {
			if ((<any>obj)[value] === undefined || (<any>obj)[value] === null)
				return [{ message: `Missing required property: ${value}` }]
		}
		return []
	}
}
