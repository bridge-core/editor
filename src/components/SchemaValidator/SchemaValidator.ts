import { JSONValidator } from './JSONValidator'

export class SchemaValidator extends JSONValidator {
	constructor(schema: any) {
		super()
	}

	validate(source: string) {
		super.validate(source)

		// TODO: Validate that source matches schema

		return this.diagnostics.length === 0
	}
}
