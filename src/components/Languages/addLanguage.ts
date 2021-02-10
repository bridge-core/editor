import { languages } from 'monaco-editor'

export interface IAddLanguageOptions {
	id: string
	extensions: string[]
	config: languages.LanguageConfiguration
	tokenProvider: any
}

export function addLanguage({
	id,
	extensions,
	config,
	tokenProvider,
}: IAddLanguageOptions) {
	languages.register({ id, extensions })
	languages.setLanguageConfiguration(id, config)
	languages.setMonarchTokensProvider(id, tokenProvider)
}
