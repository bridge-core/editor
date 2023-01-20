import { Schema } from './Schema'

export class DeprecationMessageSchema extends Schema {
	public readonly types = []

	constructor(location: string, key: string, value: unknown) {
		if (typeof value !== 'string') {
			throw new Error(
				`[${location}] Type of "deprecationMessage" must be string, found ${typeof value}`
			)
		}

		super(location, key, value)
	}

	getSchemasFor() {
		return []
	}

	getCompletionItems() {
		return []
	}

	validate() {
		return [
			{
				message: <string>this.value,
				severity: <const>'warning',
			},
		]
	}
}
