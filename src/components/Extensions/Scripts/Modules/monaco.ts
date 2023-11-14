import { IModuleConfig } from '../types'
import { useMonaco } from '../../../../libs/libs/useMonaco'
import type { languages } from 'monaco-editor'

export const MonacoModule = ({ disposables }: IModuleConfig) => ({
	registerDocumentFormattingEditProvider: async (
		languageId: string,
		provider: languages.DocumentFormattingEditProvider
	) => {
		const { languages } = await useMonaco()

		disposables.push(
			languages.registerDocumentFormattingEditProvider(
				languageId,
				provider
			)
		)
	},
})
