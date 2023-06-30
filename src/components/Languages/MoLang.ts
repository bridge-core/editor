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
		const { Range } = await useMonaco()

		const project = await App.getApp().then((app) => app.project)
		if (!(project instanceof BedrockProject)) return

		const molangData = project.molangData
		await molangData.fired

		let completionItems: languages.CompletionItem[] = []

		// Get the entire line
		const line = model.getLineContent(position.lineNumber)
		// Attempt to look behind the cursor to get context on what to propose
		const lineUntilCursor = line.slice(0, position.column - 1)

		// Function argument auto-completions
		// const withinBrackets

		// Namespace property auto-compeltions
		// TODO - place cursor in brackets after inserting text
		let isAccessingNamespace = false
		if (lineUntilCursor.endsWith('.')) {
			const strippedLine = lineUntilCursor.slice(0, -1)
			const schema = await molangData.getSchema()
			for (const entry of schema) {
				if (
					entry.namespace.some((namespace) =>
						strippedLine.endsWith(namespace)
					)
				) {
					isAccessingNamespace = true
					completionItems = completionItems.concat(
						(
							await molangData.getCompletionItemFromValues(
								entry.values
							)
						).map((suggestion) => ({
							...suggestion,
							range: new Range(
								position.lineNumber,
								position.column,
								position.lineNumber,
								position.column
							),
						}))
					)
				}
			}
		}

		// Global instance namespace auto-completions
		if (!isAccessingNamespace)
			completionItems = completionItems.concat(
				(await molangData.getNamespaceSuggestions()).map(
					(suggestion) => ({
						...suggestion,
						range: new Range(
							position.lineNumber,
							position.column,
							position.lineNumber,
							position.column
						),
					})
				)
			)

		return {
			suggestions: completionItems,
		}
	},
}

const loadValues = async (lang: MoLangLanguage) => {
	const app = await App.getApp()
	await app.projectManager.fired

	const project = app.project
	if (!(project instanceof BedrockProject)) return

	await project.molangData.fired

	const values = await project.molangData.allValues()
	tokenProvider.root = values
		.map((value) => [value, 'variable'])
		.concat(<any>tokenProvider.tokenizer.root)

	// TODO - not working?
	lang.updateTokenProvider(tokenProvider)
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

	onModelAdded(model: editor.ITextModel) {
		const isLangFor = super.onModelAdded(model)
		if (!isLangFor) return false

		loadValues(this)

		return true
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
