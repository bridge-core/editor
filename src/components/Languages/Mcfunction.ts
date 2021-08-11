import debounce from 'lodash.debounce'
import {
	CancellationToken,
	editor,
	languages,
	Position,
	Range,
} from 'monaco-editor'
import { BedrockProject } from '../Projects/Project/BedrockProject'
import { Language } from './Language'
import { tokenizeCommand } from './Mcfunction/tokenize'
import { App } from '/@/App'
import './Mcfunction/WithinJson'
import { tokenProvider } from './Mcfunction/TokenProvider'
import { FileType } from '../Data/FileType'

export const config: languages.LanguageConfiguration = {
	comments: {
		lineComment: '#',
	},
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
			open: '"',
			close: '"',
		},
	],
}

const completionItemProvider: languages.CompletionItemProvider = {
	triggerCharacters: [' '],
	async provideCompletionItems(
		model: editor.ITextModel,
		position: Position,
		context: languages.CompletionContext,
		token: CancellationToken
	) {
		const project = await App.getApp().then((app) => app.project)
		if (!(project instanceof BedrockProject)) return
		const commandData = project.commandData
		await commandData.fired

		const lineUntilCursor = model
			.getLineContent(position.lineNumber)
			.slice(0, position.column - 1)

		const { tokens } = tokenizeCommand(lineUntilCursor)

		// Get the last token
		const lastToken = tokens[tokens.length - 1]

		const completionItems = await commandData.getNextCompletionItems(
			tokens.map((token) => token.word)
		)

		return {
			suggestions: completionItems.map(
				({ label, insertText, documentation, kind }) => ({
					label: label ?? insertText,
					insertText,
					documentation,
					kind,
					range: new Range(
						position.lineNumber,
						(lastToken?.startColumn ?? 0) + 1,
						position.lineNumber,
						(lastToken?.endColumn ?? 0) + 1
					),
				})
			),
		}
	},
}

const loadCommands = async (lang: McfunctionLanguage) => {
	const app = await App.getApp()
	await app.projectManager.fired

	const project = app.project
	if (!(project instanceof BedrockProject)) return

	await project.commandData.fired
	const commands = await project.commandData.allCommands(
		undefined,
		!project.compilerManager.hasFired
	)
	tokenProvider.keywords = commands.map((command) => command)

	lang.updateTokenProvider(tokenProvider)
}

export class McfunctionLanguage extends Language {
	constructor() {
		super({
			id: 'mcfunction',
			extensions: ['mcfunction'],
			config,
			tokenProvider,
			completionItemProvider,
		})

		App.getApp().then(async (app) => {
			await app.projectManager.projectReady.fired
			app.project.compilerManager.fired.then(() => loadCommands(this))

			this.disposables.push(
				app.projectManager.forEachProject((project) => {
					this.disposables.push(
						project.fileSave.any.on(([filePath]) => {
							// Whenever a custom command gets saved, we need to update the token provider to account for a potential custom command name change
							if (FileType.getId(filePath) === 'customCommand')
								loadCommands(this)
						})
					)
				})
			)
		})
	}

	onModelAdded(model: editor.ITextModel) {
		const isLangFor = super.onModelAdded(model)
		if (!isLangFor) return false

		loadCommands(this)

		return true
	}

	validate() {}
}
