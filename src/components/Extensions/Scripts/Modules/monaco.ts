import { languages } from 'monaco-editor'
import { IModuleConfig } from '../types'

export const MonacoModule = ({ disposables }: IModuleConfig) => ({
	registerDocumentFormattingEditProvider: (
		languageId: string,
		provider: languages.DocumentFormattingEditProvider
	) => {
		disposables.push(
			languages.registerDocumentFormattingEditProvider(
				languageId,
				provider
			)
		)
	},
})
