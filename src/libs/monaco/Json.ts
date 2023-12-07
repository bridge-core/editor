import { languages } from 'monaco-editor'

let schemas: any[] = []

export function addSchemas(schemas: any[]) {
	schemas.push(...schemas.filter((schema) => !schemas.includes(schema)))

	languages.json.jsonDefaults.setDiagnosticsOptions({
		enableSchemaRequest: false,
		allowComments: true,
		validate: true,
		schemas,
	})
}

export function removeSchemas(schemas: any[]) {
	schemas = schemas.filter((schema) => !schemas.includes(schema))

	languages.json.jsonDefaults.setDiagnosticsOptions({
		enableSchemaRequest: false,
		allowComments: true,
		validate: true,
		schemas,
	})
}
