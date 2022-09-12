import type {
	CancellationToken,
	editor,
	languages,
	Position,
} from 'monaco-editor'
import { Language } from './Language'
import { CustomMoLang } from 'molang'
import { useMonaco } from '/@/utils/libs/useMonaco'
import { tokenProvider } from './Molang/TokenProvider'
import { App } from '/@/App'
import { BedrockProject } from '/@/components/Projects/Project/BedrockProject'

export const config: languages.LanguageConfiguration = {
	comments: {
		lineComment: '#',
	},
	brackets: [
		['(', ')'],
		['[', ']'],
		['{', '}'],
	],
	autoClosingPairs: [
		{
			open: '(',
			close: ')',
		},
		{
			open: '[',
			close: ']',
		},
		{
			open: '{',
			close: '}',
		},
		{
			open: "'",
			close: "'",
		},
	],
}

// TODO - dynamic completions for custom molang functions
const completionItemProvider: languages.CompletionItemProvider = {
	triggerCharacters: ['.', '(', ',', "'"],
	provideCompletionItems: async (
		model: editor.ITextModel,
		position: Position,
		context: languages.CompletionContext,
		token: CancellationToken
	) => {
		const project = await App.getApp().then((app) => app.project)
		if (!(project instanceof BedrockProject)) return

		const molangData = project.molangData
		await molangData.fired

		// Get the entire line
		const line = model.getLineContent(position.lineNumber)
		// Attempt to look behind the cursor to get context on what to propose
		const lineUntilCursor = line.slice(0, position.column - 1)

		// Auto-completions for global instances
		const { Range } = await useMonaco()

		return {
			suggestions: (await molangData.getGlobalSuggestions()).map(
				(suggestion) => {
					return <languages.CompletionItem>{
						...suggestion,
						range: new Range(
							position.lineNumber,
							position.column,
							position.lineNumber,
							position.column
						),
					}
				}
			),
		}
	},
}

export class MoLangLanguage extends Language {
	protected molang = new CustomMoLang({})
	constructor() {
		super({
			id: 'molang',
			extensions: ['molang'],
			config,
			tokenProvider,
			completionItemProvider,
		})
	}

	async validate(model: editor.IModel) {
		const { editor, MarkerSeverity } = await useMonaco()

		try {
			this.molang.parse(model.getValue())
			editor.setModelMarkers(model, this.id, [])
		} catch (err: any) {
			// const token = this.molang.getParser().getLastConsumed()
			// console.log(
			// 	token?.getType(),
			// 	token?.getText(),
			// 	token?.getPosition()
			// )

			let {
				startColumn = 0,
				endColumn = Infinity,
				startLineNumber = 0,
				endLineNumber = Infinity,
			} = /*token?.getPosition() ??*/ {}

			editor.setModelMarkers(model, this.id, [
				{
					startColumn: startColumn + 1,
					endColumn: endColumn + 1,
					startLineNumber: startLineNumber + 1,
					endLineNumber: endLineNumber + 1,
					message: err.message,
					severity: MarkerSeverity.Error,
				},
			])
		}
	}
}
