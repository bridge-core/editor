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
	currentMonarchLanguage?.dispose()

	const newMonarchLanguage = languages.setMonarchTokensProvider(
		'json',
		tokenProvider
	)

	currentMonarchLanguage = newMonarchLanguage

	// For some reason it seems like monarch languages don't apply right away so we wait a tiny bit for it to apply
	return new Promise<void>((res) => {
		setTimeout(() => {
			res()
		}, 10)
	})
}
