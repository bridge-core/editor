import type { languages, editor, Range } from 'monaco-editor'
import { BedrockProject } from '/@/components/Projects/Project/BedrockProject'
import { colorCodes } from './Common/ColorCodes'
import { Language } from './Language'
import { App } from '/@/App'
import { useMonaco } from '/@/utils/libs/useMonaco'
import { guessValue } from './Lang/guessValue'
import { translate } from '/@/components/Locales/Manager'
import { Project } from '../Projects/Project/Project'

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

const completionItemProvider: languages.CompletionItemProvider = {
	triggerCharacters: ['='],
	provideCompletionItems: async (model, position) => {
		const project = await App.getApp().then((app) => app.project)
		if (!(project instanceof BedrockProject)) return

		const { Range, languages } = await useMonaco()
		const langData = project.langData
		await langData.fired

		const app = await App.getApp()
		// Only auto-complete in a client lang file
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
			// Get the lang keys that are already set in the file
			const currentLangKeys = new Set(
				model
					.getValue()
					.split('\n')
					.map((line) => line.split('=')[0].trim())
			)

			const validLangKeys = (await langData.getValidLangKeys()).filter(
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
		} else {
			// Generate a value based on the key
			const line = model
				.getValueInRange(
					new Range(
						position.lineNumber,
						0,
						position.lineNumber,
						position.column
					)
				)
				.toLowerCase()

			// Check whether the cursor is after a key and equals sign, but no value yet (e.g. "tile.minecraft:dirt.name=")
			if (line[line.length - 1] === '=') {
				const translation = (await guessValue(line)) ?? ''
				suggestions.push({
					label: translation,
					insertText: translation,
					kind: languages.CompletionItemKind.Text,
					range: new Range(
						position.lineNumber,
						position.column,
						position.lineNumber,
						position.column
					),
				})
			}
		}

		return {
			suggestions,
		}
	},
}
const codeActionProvider: languages.CodeActionProvider = {
	provideCodeActions: async (
		model: editor.ITextModel,
		range: Range,
		context: languages.CodeActionContext
	) => {
		const { Range } = await useMonaco()

		const actions: languages.CodeAction[] = []
		for (const marker of context.markers) {
			const line = model.getLineContent(marker.startLineNumber)
			const val = await guessValue(line)

			actions.push({
				title: translate('editors.langValidation.noValue.quickFix'),
				diagnostics: [marker],
				kind: 'quickfix',
				edit: {
					edits: [
						{
							resource: model.uri,
							edit: {
								range: new Range(
									marker.startLineNumber,
									marker.startColumn,
									marker.endLineNumber,
									marker.endColumn
								),
								text: `${line}=${val}`,
							},
						},
					],
				},
				isPreferred: true,
			})
		}
		return {
			actions: actions,
			dispose: () => {},
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
			codeActionProvider,
		})

		// Highlight namespaces
		this.disposables.push(
			App.eventSystem.on('projectChanged', (project: Project) => {
				const tokenizer = {
					root: [
						...new Set(
							[
								'minecraft',
								'bridge',
								project.config.get().namespace,
							].filter((k) => k !== undefined)
						),
					]
						.map((word) => [word, 'keyword'])
						.concat(<any>tokenProvider.tokenizer.root),
				}

				this.updateTokenProvider({ tokenizer })
			})
		)
	}

	async validate(model: editor.IModel) {
		const { editor, MarkerSeverity } = await useMonaco()

		const markers: editor.IMarkerData[] = []
		for (let l = 1; l <= model.getLineCount(); l++) {
			const line = model.getLineContent(l)
			if (line && !line.includes('=') && !line.startsWith('##'))
				markers.push({
					startColumn: 1,
					endColumn: line.length + 1,
					startLineNumber: l,
					endLineNumber: l,
					message: translate(
						'editors.langValidation.noValue.errorMessage'
					),
					severity: MarkerSeverity.Error,
				})
		}
		editor.setModelMarkers(model, this.id, markers)
	}
}
