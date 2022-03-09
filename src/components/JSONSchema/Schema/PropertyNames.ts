import { RootSchema } from './Root'
import { Schema } from './Schema'

export class PropertyNamesSchema extends Schema {
	protected rootSchema: RootSchema
	public readonly types = []

	constructor(location: string, key: string, value: unknown) {
		super(location, key, value)

		this.rootSchema = new RootSchema(this.location, 'propertyNames', value)
	}

	getSchemasFor() {
		return []
	}

	getCompletionItems(obj: unknown) {
		return this.rootSchema
			.getCompletionItems(obj)
			.filter((completionItem) => completionItem.type === 'value')
			.map(
				(completionItem) =>
					<const>{
						type: 'object',
						label: `${completionItem.value}`,
						value: completionItem.value,
					}
			)
	}

	validate() {
		// TODO: Add proper property name validation
		return []
	}

	isTrue(obj: unknown) {
		return this.rootSchema.isValid(obj)
	}
}
