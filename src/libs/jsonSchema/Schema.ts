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

	public abstract getCompletionItems(value: unknown, path: string): CompletionItem[]

	public isValid(value: unknown) {
		return this.validate(value).length === 0
	}
}

function getType(value: unknown) {
	if (Array.isArray(value)) return 'array'

	if (value === null) return 'null'

	return typeof value
}

function matchesType(value: unknown, type: string): boolean {
	const detectedType = getType(value)

	if (type === 'integer' && detectedType === 'number') return Number.isInteger(value)

	return detectedType === type
}

// TODO: Investigate optimizatations!

// TODO: Investigate translating errors

// TODO: Handle other types of schemas

// TODO: Use correct pathing (do a/ instead of /a )

const validPartProperties = [
	'properties',
	'type',
	'required',
	'additionalProperties',
	'items',
	'enum',
	'const',
	'pattern',
	'default',
]

const ignoredProperties = [
	'title',
	'description',
	'$schema',
	'$id',
	// TODO: Proper implementation of these fields
	'definitions',
	'min',
	'max',
	'maxItems',
	'minItems',
	'examples',
	'minimum',
	'maximum',
	'format',
	'maxLength',
	'multipleOf',
	'markdownDescription',
]

export function createSchema(
	part: JsonObject,
	requestSchema: (path: string) => JsonObject | undefined,
	path: string = ''
) {
	if ('$ref' in part) return new RefSchema(part, requestSchema, path)

	if ('if' in part) return new IfSchema(part, requestSchema, path)

	if ('allOf' in part) return new AllOfSchema(part, requestSchema, path)

	if ('anyOf' in part) return new AnyOfSchema(part, requestSchema, path)

	return new ValueSchema(part, requestSchema, path)
}

export class AllOfSchema extends Schema {
	public constructor(
		public part: JsonObject,
		public requestSchema: (path: string) => JsonObject | undefined,
		public path: string = ''
	) {
		super(requestSchema, path)
	}

	public validate(value: unknown): Diagnostic[] {
		let parts: JsonObject[] = this.part.allOf as any

		let diagnostics: Diagnostic[] = []

		for (const part of parts) {
			const schema = createSchema(part, this.requestSchema, this.path)

			diagnostics = diagnostics.concat(schema.validate(value))
		}

		return diagnostics
	}

	public getCompletionItems(value: unknown, path: string): CompletionItem[] {
		throw new Error('Method not implemented.')
	}
}

export class AnyOfSchema extends Schema {
	public constructor(
		public part: JsonObject,
		public requestSchema: (path: string) => JsonObject | undefined,
		public path: string = ''
	) {
		super(requestSchema, path)
	}

	public validate(value: unknown): Diagnostic[] {
		let parts: JsonObject[] = this.part.anyOf as any

		let diagnostics: Diagnostic[] = []

		for (const part of parts) {
			const schema = createSchema(part, this.requestSchema, this.path)

			const result = schema.validate(value)

			if (result.length === 0) return []

			if (diagnostics.length === 0) diagnostics = result
		}

		return diagnostics
	}

	public getCompletionItems(value: unknown, path: string): CompletionItem[] {
		throw new Error('Method not implemented.')
	}
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
		let processedPart = { ...this.part }

		delete processedPart.$ref

		processedPart = { ...processedPart, ...this.requestSchema(this.part.$ref as string) }

		return createSchema(processedPart, this.requestSchema, this.path).validate(value)
	}

	public getCompletionItems(value: unknown, path: string): CompletionItem[] {
		let processedPart = { ...this.part }

		delete processedPart.$ref

		processedPart = { ...processedPart, ...this.requestSchema(this.part.$ref as string) }

		return createSchema(processedPart, this.requestSchema, this.path).getCompletionItems(value, path)
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
		const condition: JsonObject | boolean = this.part.if as any
		const passResult: JsonObject = this.part.then as any
		const failResult: JsonObject | undefined = this.part.else as any

		let processedPart = { ...this.part }

		delete processedPart.if
		delete processedPart.then

		if ('else' in processedPart) delete processedPart.else

		let passed = false

		if (getType(condition) === 'boolean') {
			passed = condition as boolean
		} else {
			const conditionSchema = createSchema(condition as JsonObject, this.requestSchema, this.path)

			passed = conditionSchema.isValid(value)
		}

		if (passed) {
			processedPart = { ...processedPart, ...passResult }
		} else if (failResult) {
			processedPart = { ...processedPart, ...failResult }
		}

		return createSchema(processedPart, this.requestSchema, this.path).validate(value)
	}

	public getCompletionItems(value: unknown, path: string): CompletionItem[] {
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
			if (!validPartProperties.includes(property) && !ignoredProperties.includes(property))
				throw new Error(`Unkown schema part property "${property}"`)
		}
	}

	public validate(value: unknown): Diagnostic[] {
		let types: undefined | string | string[] = this.part.type as any
		if (types !== undefined && !Array.isArray(types)) types = [types]

		let diagnostics: Diagnostic[] = []

		if (types !== undefined) {
			let foundMatch = false

			for (const type of types) {
				if (matchesType(value, type)) {
					foundMatch = true

					break
				}
			}

			if (!foundMatch) {
				diagnostics.push({
					severity: 'warning',
					message: `Incorrect type. Expected ${types.toString()}.`,
					path: this.path,
				})

				return diagnostics
			}
		}

		// TODO: Object equality
		// TODO: Move const to own schema type
		if ('const' in this.part) {
			if (value !== this.part.const) {
				diagnostics.push({
					severity: 'warning',
					message: `Found "${value}" here; expected "${this.part.const}"`,
					path: this.path,
				})

				return diagnostics
			}
		}

		if ('pattern' in this.part) {
			if (!new RegExp(this.part.pattern as string).test(value as string)) {
				diagnostics.push({
					severity: 'warning',
					message: `"${value}" is not valid here.`,
					path: this.path,
				})

				return diagnostics
			}
		}

		const valueType = getType(value)

		if (valueType === 'object') {
			const properties = Object.keys(value as JsonObject)

			const requiredProperties: undefined | string[] = this.part.required as any

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
				const propertyDefinitions: JsonObject = this.part.properties as any
				const definedProperties = Object.keys(propertyDefinitions)

				// TODO: Support schema
				let additionalProperties: undefined | boolean | unknown = this.part.additionalProperties as any
				if (!('additionalProperties' in this.part)) additionalProperties = true

				for (const property of properties) {
					if (!definedProperties.includes(property)) {
						if (!additionalProperties) {
							// TODO: Proper message
							diagnostics.push({
								severity: 'warning',
								message: `Property ${property} is not allowed.`,
								path: this.path + '/' + property,
							})

							console.warn(additionalProperties, definedProperties, propertyDefinitions, property)

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
			if ('items' in this.part) {
				const itemsDefinition: JsonObject = this.part.items as any

				for (let index = 0; index < value.length; index++) {
					const schema = createSchema(itemsDefinition, this.requestSchema, this.path + '/' + index.toString())

					diagnostics = diagnostics.concat(schema.validate(value[index]))
				}
			}
		} else {
			if (this.part.enum) {
				const allowedValues: (string | number | null)[] = this.part.enum as any

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

	public getCompletionItems(value: unknown, path: string): CompletionItem[] {
		if ('const' in this.part) {
			return [
				{
					type: 'value',
					label: this.part.const as string,
					value: this.part.const,
				},
			]
		}

		let completions: CompletionItem[] = []

		const valueType = getType(value)

		if (valueType === 'object') {
			if ('properties' in this.part) {
				const propertyDefinitions: JsonObject = this.part.properties as any
				const definedProperties = Object.keys(propertyDefinitions)

				for (const property of definedProperties) {
					const schema = createSchema(
						(this.part.properties as JsonObject)[property] as JsonObject,
						this.requestSchema,
						this.path + '/' + property
					)

					completions = completions.concat(schema.getCompletionItems((value as JsonObject)[property], path))
				}
			}
		} else if (Array.isArray(value)) {
			if ('items' in this.part) {
				const itemsDefinition: JsonObject = this.part.items as any

				for (let index = 0; index < value.length; index++) {
					const schema = createSchema(itemsDefinition, this.requestSchema, this.path + '/' + index.toString())

					completions = completions.concat(schema.getCompletionItems(value[index], path))
				}
			}
		} else {
			if (this.part.enum) {
				const allowedValues: (string | number | null)[] = this.part.enum as any

				completions = completions.concat(
					allowedValues.map((value) => ({
						type: 'value',
						label: value?.toString() ?? 'undefined',
						value: value,
					}))
				)
			}
		}

		return completions
	}
}
