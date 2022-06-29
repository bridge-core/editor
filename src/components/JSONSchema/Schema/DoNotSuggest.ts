import { Schema } from './Schema'

export class DoNotSuggestSchema extends Schema {
	public readonly types = []

	constructor(location: string, key: string, value: unknown) {
		if (typeof value !== 'boolean') {
			throw new Error(
				`[${location}] Type of "doNotSuggest" must be boolean, found ${typeof value}`
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
		return []
	}
}
