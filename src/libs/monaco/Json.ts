import { languages } from 'monaco-editor'

interface SchemaDefinition {
	readonly uri: string
	readonly fileMatch?: string[]
	readonly schema?: any
}

let schemas: SchemaDefinition[] = []

export function addSchema(schema: SchemaDefinition) {
	console.log('Adding schmea', schema)

	if (schemas.find((otherSchema) => otherSchema.uri === schema.uri)) return

	schemas.push(schema)

	languages.json.jsonDefaults.setDiagnosticsOptions({
		enableSchemaRequest: false,
		allowComments: true,
		validate: true,
		schemas,
	})
}

export function removeSchema(schemaUri: string) {
	schemas = schemas.filter((schema) => schema.uri !== schemaUri)

	languages.json.jsonDefaults.setDiagnosticsOptions({
		enableSchemaRequest: false,
		allowComments: true,
		validate: true,
		schemas,
	})
}
