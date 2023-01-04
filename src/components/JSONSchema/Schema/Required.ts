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

		if (Array.isArray(obj)) {
			return [
				<const>{
					severity: 'warning',
					message: `Required properties missing: ${values.join(
						', '
					)}`,
				},
			]
		}

		/**
		 * @TODO - Support for passing down parent object so we can validate the parent object in the case described below.
		 *
		 * Case for key existence checks like this one:
		 *
		 * properties: {
		 *   name: {
		 *     required: ['name']
		 *   }
		 * }
		 *
		 * -> If typeof obj !== 'object, the validation should pass because we have no way to validate the parent object yet.
		 */
		if (typeof obj !== 'object') {
			return []
		}

		for (const value of values) {
			if ((<any>obj)[value] === undefined || (<any>obj)[value] === null)
				return [
					<const>{
						severity: 'warning',
						message: `Missing required property: ${value}`,
					},
				]
		}
		return []
	}
}
