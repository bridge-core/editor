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

	public abstract getTypes(value: unknown, path: string): string[]

	public isValid(value: unknown) {
		return this.validate(value).length === 0
	}
}

export function getType(value: unknown) {
	if (Array.isArray(value)) return 'array'

	if (value === null) return 'null'

	return typeof value
}

function matchesType(value: unknown, type: string): boolean {
	const detectedType = getType(value)

	if (type === 'integer' && detectedType === 'number') return Number.isInteger(value)

	return detectedType === type
}

// TODO: Investigate translating errors
// TODO: Optimize get completions

const validPartProperties = [
	'properties',
	'patternProperties',
	'type',
	'required',
	'additionalProperties',
	'items',
	'enum',
	'const',
	'pattern',
	'default',
	'doNotSuggest',
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
	'deprecationMessage',
]

export function createSchema(
	part: JsonObject,
	requestSchema: (path: string) => JsonObject | undefined,
	path: string = '/'
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
		public path: string = '/'
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
		let parts: JsonObject[] = this.part.allOf as any

		let diagnostics: CompletionItem[] = []

		for (const part of parts) {
			const schema = createSchema(part, this.requestSchema, this.path)

			diagnostics = diagnostics.concat(schema.getCompletionItems(value, path))
		}

		return diagnostics
	}

	public getTypes(value: unknown, path: string): string[] {
		let parts: JsonObject[] = this.part.allOf as any

		let types: string[] = []

		for (const part of parts) {
			const schema = createSchema(part, this.requestSchema, this.path)

			types = types.concat(schema.getTypes(value, path))
		}

		return types
	}
}

export class AnyOfSchema extends Schema {
	public constructor(
		public part: JsonObject,
		public requestSchema: (path: string) => JsonObject | undefined,
		public path: string = '/'
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
		let parts: JsonObject[] = this.part.anyOf as any

		let diagnostics: CompletionItem[] = []

		for (const part of parts) {
			const schema = createSchema(part, this.requestSchema, this.path)

			diagnostics = diagnostics.concat(schema.getCompletionItems(value, path))
		}

		return diagnostics
	}

	public getTypes(value: unknown, path: string): string[] {
		let parts: JsonObject[] = this.part.anyOf as any

		let types: string[] = []

		for (const part of parts) {
			const schema = createSchema(part, this.requestSchema, this.path)

			types = types.concat(schema.getTypes(value, path))
		}

		return types
	}
}

export class RefSchema extends Schema {
	public constructor(
		public part: JsonObject,
		public requestSchema: (path: string) => JsonObject | undefined,
		public path: string = '/'
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

	public getTypes(value: unknown, path: string): string[] {
		let processedPart = { ...this.part }

		delete processedPart.$ref

		processedPart = { ...processedPart, ...this.requestSchema(this.part.$ref as string) }

		return createSchema(processedPart, this.requestSchema, this.path).getTypes(value, path)
	}
}

export class IfSchema extends Schema {
	public constructor(
		public part: JsonObject,
		public requestSchema: (path: string) => JsonObject | undefined,
		public path: string = '/'
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

		return createSchema(processedPart, this.requestSchema, this.path).getCompletionItems(value, path)
	}

	public getTypes(value: unknown, path: string): string[] {
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

		return createSchema(processedPart, this.requestSchema, this.path).getTypes(value, path)
	}
}

export class ValueSchema extends Schema {
	public constructor(
		public part: JsonObject,
		public requestSchema: (path: string) => JsonObject | undefined,
		public path: string = '/'
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

			if ('properties' in this.part || 'patternProperties' in this.part) {
				const propertyDefinitions: JsonObject = (this.part.properties as any) ?? {}
				const definedProperties = Object.keys(propertyDefinitions)

				const patternDefinitions: JsonObject = (this.part.patternProperties as any) ?? {}
				const definedPatterns = Object.keys(patternDefinitions)

				// TODO: Support schema
				let additionalProperties: undefined | boolean | unknown = this.part.additionalProperties as any
				if (!('additionalProperties' in this.part)) additionalProperties = true

				for (const property of properties) {
					if (!definedProperties.includes(property)) {
						let matchesPatterns =
							definedPatterns.find((pattern) => new RegExp(pattern).test(property)) !== undefined

						if (!matchesPatterns && !additionalProperties) {
							// TODO: Proper message
							diagnostics.push({
								severity: 'warning',
								message: `Property ${property} is not allowed.`,
								path: this.path + property + '/',
							})

							return diagnostics
						}
					} else {
						const schema = createSchema(
							(propertyDefinitions[property] as JsonObject) ??
								patternDefinitions[
									definedPatterns.find((pattern) => new RegExp(pattern).test(property))!
								],
							this.requestSchema,
							this.path + property + '/'
						)

						diagnostics = diagnostics.concat(schema.validate((value as JsonObject)[property]))
					}
				}
			}
		} else if (Array.isArray(value)) {
			if ('items' in this.part) {
				const itemsDefinition: JsonObject = this.part.items as any

				for (let index = 0; index < value.length; index++) {
					const schema = createSchema(itemsDefinition, this.requestSchema, this.path + 'any_index/')

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
		if ('doNotSuggest' in this.part) return []

		if ('const' in this.part) {
			if (value === this.part.const) return []

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

				if (this.path === path) {
					completions = completions.concat(
						definedProperties
							.map(
								(property) =>
									({
										label: property,
										type: 'value',
										value: property,
									} as CompletionItem)
							)
							.filter((completion) => !((completion.value as string) in (value as JsonObject)))
					)
				} else {
					for (const property of definedProperties) {
						if (!path.startsWith(this.path + property + '/')) continue

						const schema = createSchema(
							(this.part.properties as JsonObject)[property] as JsonObject,
							this.requestSchema,
							this.path + property + '/'
						)

						completions = completions.concat(
							schema.getCompletionItems((value as JsonObject)[property], path)
						)
					}
				}
			}
		} else if (Array.isArray(value)) {
			if (path.startsWith(this.path + 'any_index/')) {
				if ('items' in this.part) {
					const itemsDefinition: JsonObject = this.part.items as any

					for (let index = 0; index < value.length; index++) {
						const schema = createSchema(itemsDefinition, this.requestSchema, this.path + 'any_index/')

						completions = completions.concat(schema.getCompletionItems(value[index], path))
					}
				}
			}
		} else {
			if (this.part.enum) {
				const allowedValues: (string | number | null)[] = this.part.enum as any

				if (this.path === path) {
					completions = completions.concat(
						allowedValues
							.map(
								(value) =>
									({
										type: 'value',
										label: value?.toString() ?? 'undefined',
										value: value,
									} as CompletionItem)
							)
							.filter((completion) => completion.value !== value)
					)
				}
			}

			if (this.path === path) {
				let types: string | string[] = (this.part.type as any) ?? []
				if (!Array.isArray(types)) types = [types]

				if (types.includes('boolean')) {
					for (const completionValue of [true, false]) {
						console.log(value, completionValue)

						if (completionValue === value) continue

						completions.push({
							label: completionValue.toString(),
							type: 'value',
							value: completionValue.toString(),
						})
					}
				}
			}
		}

		let uniqueCompletions = []

		for (let index = 0; index < completions.length; index++) {
			if (completions.findIndex((completion) => completion.label === completions[index].label) !== index) continue

			uniqueCompletions.push(completions[index])
		}

		return uniqueCompletions
	}

	public getTypes(value: unknown, path: string): string[] {
		if (path === this.path) {
			let types: string | string[] = (this.part.type as any) ?? []
			if (!Array.isArray(types)) types = [types]

			return types
		}

		let types: string[] = []

		const valueType = getType(value)

		if (valueType === 'object') {
			if ('properties' in this.part) {
				const propertyDefinitions: JsonObject = this.part.properties as any
				const definedProperties = Object.keys(propertyDefinitions)

				for (const property of definedProperties) {
					if (!path.startsWith(this.path + property + '/')) continue

					const schema = createSchema(
						(this.part.properties as JsonObject)[property] as JsonObject,
						this.requestSchema,
						this.path + property + '/'
					)

					types = types.concat(schema.getTypes((value as JsonObject)[property], path))
				}
			}
		} else if (Array.isArray(value)) {
			if (path.startsWith(this.path + 'any_index/')) {
				if ('items' in this.part) {
					const itemsDefinition: JsonObject = this.part.items as any

					for (let index = 0; index < value.length; index++) {
						const schema = createSchema(itemsDefinition, this.requestSchema, this.path + 'any_index/')

						types = types.concat(schema.getTypes(value[index], path))
					}
				}
			}
		}

		let uniqueTypes = []

		for (let index = 0; index < types.length; index++) {
			if (types.findIndex((type) => type === types[index]) !== index) continue

			uniqueTypes.push(types[index])
		}

		return uniqueTypes
	}
}
