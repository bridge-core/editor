import { IDisposable, languages } from 'monaco-editor'

interface SchemaDefinition {
	readonly uri: string
	readonly fileMatch?: string[]
	readonly schema?: any
}

let settings: {
	enableSchemaRequest: boolean
	allowComments: boolean
	validate: boolean
	schemas: SchemaDefinition[]
} = {
	enableSchemaRequest: false,
	allowComments: true,
	validate: true,
	schemas: [],
}

function updateDefaults() {
	languages.json.jsonDefaults.setDiagnosticsOptions(settings)
}

export function setSchemas(schemas: SchemaDefinition[]) {
	settings.schemas = schemas

	updateDefaults()
}

updateDefaults()

let currentMonarchLanguage: IDisposable | null = null

export function setMonarchTokensProvider(
	tokenProvider: languages.IMonarchLanguage
) {
	const newMonarchLanguage = languages.setMonarchTokensProvider(
		'json',
		tokenProvider
	)

	currentMonarchLanguage?.dispose()

	currentMonarchLanguage = newMonarchLanguage
}