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
	public constructor(public requestSchema: (path: string) => JsonObject | undefined, public path: string) {}

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

const validPartProperties = [
	'properties',
	'type',
	'required',
	'additionalProperties',
	'items',
	'title',
	'description',
	'enum',
]

export function createSchema(
	part: JsonObject,
	requestSchema: (path: string) => JsonObject | undefined,
	path: string = ''
) {
	if ('$ref' in part) return new RefSchema(part, requestSchema, path)

	// if ('if' in part) return new IfSchema(part, requestSchema, path)

	return new ValueSchema(part, requestSchema, path)
}

export class RefSchema extends Schema {
	public constructor(
		public part: JsonObject,
		public requestSchema: (path: string) => JsonObject | undefined,
		public path: string = ''
	) {
		super(requestSchema, path)
	}

	public validate(value: unknown): Diagnostic[] {
		console.log('Validating Ref schema', this.path, this.part, value)

		let processedPart = { ...this.part }

		delete processedPart.$ref

		processedPart = { ...processedPart, ...this.requestSchema(this.part.$ref as string) }

		return createSchema(processedPart, this.requestSchema, this.path).validate(value)
	}

	public getCompletionItems(value: unknown): CompletionItem[] {
		throw new Error('Method not implemented.')
	}
}

export class IfSchema extends Schema {
	public constructor(
		public part: JsonObject,
		public requestSchema: (path: string) => JsonObject | undefined,
		public path: string = ''
	) {
		super(requestSchema, path)
	}

	public validate(value: unknown): Diagnostic[] {
		throw new Error('Method not implemented.')
	}

	public getCompletionItems(value: unknown): CompletionItem[] {
		throw new Error('Method not implemented.')
	}
}

export class ValueSchema extends Schema {
	public constructor(
		public part: JsonObject,
		public requestSchema: (path: string) => JsonObject | undefined,
		public path: string = ''
	) {
		super(requestSchema, path)

		// To help identify unhandled cases
		const partProperties = Object.keys(this.part)

		for (const property of partProperties) {
			if (!validPartProperties.includes(property)) throw new Error(`Unkown schema part property "${property}"`)
		}
	}

	public validate(value: unknown): Diagnostic[] {
		console.log('Validating schema', this.path, this.part, value)

		let types: undefined | string | string[] = <undefined | string | string[]>this.part.type
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

			const requiredProperties: undefined | string[] = <undefined | string[]>this.part.required

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
								severity: 'warning',
								message: `Property ${property} is not allowed.`,
								path: this.path + '/' + property,
							})

							return diagnostics
						}
					} else {
						const schema = createSchema(
							(this.part.properties as JsonObject)[property] as JsonObject,
							this.requestSchema,
							this.path + '/' + property
						)

						diagnostics = diagnostics.concat(schema.validate((value as JsonObject)[property]))
					}
				}
			}
		} else if (Array.isArray(value)) {
			const itemsDefinition: JsonObject = <JsonObject>this.part.items

			for (let index = 0; index < value.length; index++) {
				const schema = createSchema(itemsDefinition, this.requestSchema, this.path + '/' + index.toString())

				diagnostics = diagnostics.concat(schema.validate(value[index]))
			}
		} else {
			if (this.part.enum) {
				const allowedValues: (string | number | null)[] = <(string | number | null)[]>this.part.enum

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
