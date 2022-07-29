import type { languages } from 'monaco-editor'
import { colorCodes } from './Common/ColorCodes'
import { Language } from './Language'
import { App } from '/@/App'
import { useMonaco } from '/@/utils/libs/useMonaco'

export const config: languages.LanguageConfiguration = {
	comments: {
		lineComment: '##',
	},
}

export const tokenProvider = {
	tokenizer: {
		root: [[/##.*/, 'comment'], [/=|\.|:/, 'definition'], ...colorCodes],
	},
}

async function getValidLangKeys() {
	const app = await App.getApp()
	const packIndexer = app.project.packIndexer

	await packIndexer.fired

	const entityIdentifiers: string[] =
		(await packIndexer.service.getCacheDataFor(
			'entity',
			undefined,
			'identifier'
		)) ?? []
	const blockIdentifiers: string[] =
		(await packIndexer.service.getCacheDataFor(
			'block',
			undefined,
			'identifier'
		)) ?? []
	const itemIdentifiers: string[] =
		(await packIndexer.service.getCacheDataFor(
			'item',
			undefined,
			'identifier'
		)) ?? []

	return [
		...entityIdentifiers.map((id) => `entity.${id}.name`),
		...entityIdentifiers.map((id) => `item.spawn_egg.entity.${id}.name`),
		...itemIdentifiers.map((id) => `item.${id}.name`),
		...blockIdentifiers.map((id) => `tile.${id}.name`),
	]
}

const completionItemProvider: languages.CompletionItemProvider = {
	provideCompletionItems: async (model, position) => {
		const { Range, languages } = await useMonaco()
		const app = await App.getApp()
		const isClientLang =
			App.fileType.getId(
				app.project.tabSystem?.selectedTab?.getPath()!
			) === 'clientLang'

		if (!isClientLang) return { suggestions: [] }

		const currentLine = model.getLineContent(position.lineNumber)

		// Find out whether our cursor is positioned after a '='
		let isValueSuggestion = false
		for (let i = position.column - 1; i >= 0; i--) {
			const char = currentLine[i]
			if (char === '=') {
				isValueSuggestion = true
			}
		}

		const suggestions: languages.CompletionItem[] = []

		if (!isValueSuggestion) {
			const currentLangKeys = new Set(
				model
					.getValue()
					.split('\n')
					.map((line) => line.split('=')[0].trim())
			)

			const validLangKeys = (await getValidLangKeys()).filter(
				(key) => !currentLangKeys.has(key)
			)

			suggestions.push(
				...validLangKeys.map((key) => ({
					range: new Range(
						position.lineNumber,
						position.column,
						position.lineNumber,
						position.column
					),
					kind: languages.CompletionItemKind.Text,
					label: key,
					insertText: key,
				}))
			)
		}

		return {
			suggestions,
		}
	},
}

export class LangLanguage extends Language {
	constructor() {
		super({
			id: 'lang',
			extensions: ['lang'],
			config,
			tokenProvider,
			completionItemProvider,
		})
	}

	validate() {}
}
