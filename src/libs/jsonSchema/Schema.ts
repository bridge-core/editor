export interface Diagnostic {
	severity: 'error' | 'warning' | 'info'
	message: string
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

// TODO: Investigate translating errors

export class ValueSchema extends Schema {
	public constructor(public part: Record<string, unknown>) {
		super()
	}

	public validate(value: unknown): Diagnostic[] {
		let types: undefined | string | string[] = <undefined | string | string[]>this.part.type
		if (types !== undefined && !Array.isArray(types)) types = [types]

		let diagnostics: Diagnostic[] = []

		if (types !== undefined) {
			const valueType = typeof value

			if (!types.includes(valueType)) {
				diagnostics.push({
					severity: 'error',
					message: `Incorrect type. Expected ${types.toString()}`,
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
							message: `TEMP MESSAGE: Missing required property. Expected ${property}`,
						})

						return diagnostics
					}
				}
			}

			// TODO: Support Pattern Properties
			if (this.part.properties) {
				const propertyDefinitions: Record<string, unknown> = <Record<string, unknown>>this.part.properties
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
								message: `TEMP MESSAGE: Invalid additional property ${property}.`,
							})

							return diagnostics
						}
					} else {
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
