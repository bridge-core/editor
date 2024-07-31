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
	public constructor(public requestSchema: (path: string) => JsonObject | undefined) {}

	public abstract validate(value: unknown): Diagnostic[]

	public abstract getCompletionItems(value: unknown): CompletionItem[]

	public isValid(value: unknown) {
		return this.validate(value).length === 0
	}
}

function getType(value: unknown) {
	if (Array.isArray(value)) return 'array'

	if (value === null) return 'null'

	return typeof value
}

// TODO: Investigate translating errors

// TODO: Handle other types of schemas

// TODO: Use correct pathing (do a/ instead of /a )

export class ValueSchema extends Schema {
	public constructor(
		public part: JsonObject,
		public requestSchema: (path: string) => JsonObject | undefined,
		public path: string = ''
	) {
		super(requestSchema)
	}

	public validate(value: unknown): Diagnostic[] {
		console.log('Validating schema', this.path, this.part, value)

		let shallowDereffedPart = { ...this.part }

		if (typeof this.part.$ref === 'string') {
			delete shallowDereffedPart.$ref

			shallowDereffedPart = { ...shallowDereffedPart, ...this.requestSchema(this.part.$ref) }

			console.log('Dereffed to', shallowDereffedPart)
		}

		let types: undefined | string | string[] = <undefined | string | string[]>shallowDereffedPart.type
		if (types !== undefined && !Array.isArray(types)) types = [types]

		let diagnostics: Diagnostic[] = []

		const valueType = getType(value)

		if (types !== undefined) {
			if (!types.includes(valueType)) {
				diagnostics.push({
					severity: 'warning',
					message: `Incorrect type. Expected ${types.toString()}.`,
					path: this.path,
				})

				return diagnostics
			}
		}

		if (valueType === 'object') {
			const properties = Object.keys(value as JsonObject)

			const requiredProperties: undefined | string[] = <undefined | string[]>shallowDereffedPart.required

			if (requiredProperties !== undefined) {
				for (const property of requiredProperties) {
					if (!properties.includes(property)) {
						// TODO: Proper message
						diagnostics.push({
							severity: 'warning',
							message: `Missing required property. Expected ${property}.`,
							path: this.path,
						})

						return diagnostics
					}
				}
			}

			// TODO: Support Pattern Properties
			if (shallowDereffedPart.properties) {
				const propertyDefinitions: JsonObject = <JsonObject>shallowDereffedPart.properties
				const definedProperties = Object.keys(propertyDefinitions)

				// TODO: Support schema
				const additionalProperties: undefined | boolean | unknown = <undefined | boolean | unknown>(
					shallowDereffedPart.additionalProperties
				)

				for (const property of properties) {
					if (!definedProperties.includes(property)) {
						if (!additionalProperties) {
							// TODO: Proper message
							diagnostics.push({
								severity: 'warning',
								message: `Property ${property} is not allowed.`,
								path: this.path + '/' + property,
							})

							return diagnostics
						}
					} else {
						const schema = new ValueSchema(
							(shallowDereffedPart.properties as JsonObject)[property] as JsonObject,
							this.requestSchema,
							this.path + '/' + property
						)

						diagnostics = diagnostics.concat(schema.validate((value as JsonObject)[property]))
					}
				}
			}
		} else if (Array.isArray(value)) {
			const itemsDefinition: JsonObject = <JsonObject>shallowDereffedPart.items

			for (let index = 0; index < value.length; index++) {
				const schema = new ValueSchema(itemsDefinition, this.requestSchema, this.path + '/' + index.toString())

				diagnostics = diagnostics.concat(schema.validate(value[index]))
			}
		} else {
			if (shallowDereffedPart.enum) {
				const allowedValues: (string | number | null)[] = <(string | number | null)[]>shallowDereffedPart.enum

				if (allowedValues.length === 0) {
					diagnostics.push({
						severity: 'warning',
						message: `Found "${value}"; but no values are valid.`,
						path: this.path,
					})

					return diagnostics
				}

				if (!allowedValues.includes(<any>value)) {
					diagnostics.push({
						severity: 'warning',
						message: `"${value}" is not valid here.`,
						path: this.path,
					})

					return diagnostics
				}
			}
		}

		return diagnostics
	}

	public getCompletionItems(value: unknown): CompletionItem[] {
		throw new Error('Method not implemented.')
	}
}
