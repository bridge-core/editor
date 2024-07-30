type JsonObject = Record<string, unknown>

export interface Diagnostic {
	severity: 'error' | 'warning' | 'info'
	message: string
	path: string
}

export interface CompletionItem {
	type: 'object' | 'array' | 'value' | 'snippet'
	label: string
	value: unknown
}

export abstract class Schema {
	public abstract validate(value: unknown): Diagnostic[]

	public abstract getCompletionItems(value: unknown): CompletionItem[]

	public isValid(value: unknown) {
		return this.validate(value).length === 0
	}
}

function getType(value: unknown) {
	if (Array.isArray(value)) return 'array'

	return typeof value
}

// TODO: Investigate translating errors

export class ValueSchema extends Schema {
	public constructor(public part: JsonObject, public path: string = '') {
		super()
	}

	public validate(value: unknown): Diagnostic[] {
		let types: undefined | string | string[] = <undefined | string | string[]>this.part.type
		if (types !== undefined && !Array.isArray(types)) types = [types]

		let diagnostics: Diagnostic[] = []

		if (types !== undefined) {
			const valueType = getType(value)

			if (!types.includes(valueType)) {
				diagnostics.push({
					severity: 'error',
					message: `Incorrect type. Expected ${types.toString()} vs ${valueType}`,
					path: this.path,
				})

				return diagnostics
			}
		}

		if (typeof value === 'object' && value !== null) {
			const properties = Object.keys(value)

			const requiredProperties: undefined | string[] = <undefined | string[]>this.part.required

			if (requiredProperties !== undefined) {
				for (const property of requiredProperties) {
					if (!properties.includes(property)) {
						// TODO: Proper message
						diagnostics.push({
							severity: 'error',
							message: `Missing required property. Expected ${property}`,
							path: this.path,
						})

						return diagnostics
					}
				}
			}

			// TODO: Support Pattern Properties
			if (this.part.properties) {
				const propertyDefinitions: JsonObject = <JsonObject>this.part.properties
				const definedProperties = Object.keys(propertyDefinitions)

				// TODO: Support schema
				const additionalProperties: undefined | boolean | unknown = <undefined | boolean | unknown>(
					this.part.additionalProperties
				)

				for (const property of properties) {
					if (!definedProperties.includes(property)) {
						if (!additionalProperties) {
							// TODO: Proper message
							diagnostics.push({
								severity: 'error',
								message: `Property ${property} is not allowed.`,
								path: this.path + '/' + property,
							})

							return diagnostics
						}
					} else {
						const schema = new ValueSchema(
							(this.part.properties as JsonObject)[property] as JsonObject,
							this.path + '/' + property
						)
						diagnostics = diagnostics.concat(schema.validate((value as JsonObject)[property]))
					}
				}
			}
		}

		return diagnostics
	}

	public getCompletionItems(value: unknown): CompletionItem[] {
		throw new Error('Method not implemented.')
	}
}
