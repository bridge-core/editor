import type {
	CancellationToken,
	editor,
	languages,
	Position,
} from 'monaco-editor'
import { BedrockProject } from '/@/components/Projects/Project/BedrockProject'
import { Language } from './Language'
import { tokenizeCommand, tokenizeTargetSelector } from 'bridge-common-utils'
import { App } from '/@/App'
import './Mcfunction/WithinJson'
import { tokenProvider } from './Mcfunction/TokenProvider'
import type { Project } from '/@/components/Projects/Project/Project'
import { isWithinTargetSelector } from './Mcfunction/TargetSelector/isWithin'
import { proxy } from 'comlink'
import { useMonaco } from '../../utils/libs/useMonaco'
import { CommandValidator } from './Mcfunction/Validator'

export const config: languages.LanguageConfiguration = {
	wordPattern: /[aA-zZ]+/,
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
			open: '"',
			close: '"',
		},
	],
}

const completionItemProvider: languages.CompletionItemProvider = {
	triggerCharacters: [' ', '[', '{', '=', ',', '!'],
	async provideCompletionItems(
		model: editor.ITextModel,
		position: Position,
		context: languages.CompletionContext,
		token: CancellationToken
	) {
		const project = await App.getApp().then((app) => app.project)
		if (!(project instanceof BedrockProject)) return

		const { Range } = await useMonaco()
		const commandData = project.commandData
		await commandData.fired

		const line = model.getLineContent(position.lineNumber)

		const lineUntilCursor = line.slice(0, position.column - 1)

		/**
		 * Auto-completions for target selector arguments
		 */
		const selector = isWithinTargetSelector(line, position.column - 1)
		if (selector) {
			const selectorStr = line.slice(
				selector.selectorStart,
				position.column - 1
			)
			const { tokens } = tokenizeTargetSelector(
				selectorStr,
				selector.selectorStart
			)
			const lastToken = tokens[tokens.length - 1]

			return {
				suggestions: await commandData.selectorArguments
					.getNextCompletionItems(tokens.map((token) => token.word))
					.then((completionItems) =>
						completionItems.map(
							({
								label,
								insertText,
								documentation,
								kind,
								insertTextRules,
							}) => ({
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
								insertTextRules,
							})
						)
					),
			}
		}

		/**
		 * Normal command auto-completions
		 */
		const { tokens } = tokenizeCommand(lineUntilCursor)
		// Get the last token
		const lastToken = tokens[tokens.length - 1]

		const completionItems = await commandData.getNextCompletionItems(
			tokens.map((token) => token.word)
		)

		return {
			suggestions: completionItems.map(
				({
					label,
					insertText,
					documentation,
					kind,
					insertTextRules,
				}) => ({
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
					insertTextRules,
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
	await project.compilerReady.fired

	const commands = await project.commandData.allCommands(
		undefined,
		!(await project.compilerService.isSetup)
	)
	tokenProvider.keywords = commands.map((command) => command)

	const targetSelectorArguments =
		await project.commandData.allSelectorArguments()
	tokenProvider.targetSelectorArguments = targetSelectorArguments

	lang.updateTokenProvider(tokenProvider)
}

export class McfunctionLanguage extends Language {
	protected validator: CommandValidator | undefined

	constructor() {
		super({
			id: 'mcfunction',
			extensions: ['mcfunction'],
			config,
			tokenProvider,
			completionItemProvider,
		})

		let loadedProject: Project | null = null
		const disposable = App.eventSystem.on(
			'projectChanged',
			async (project: Project) => {
				loadedProject = project
				loadCommands(this)

				await project.compilerReady.fired

				await project.compilerService.once(
					proxy(() => {
						// Make sure that we are still supposed to update the language
						// -> project didn't change
						if (project === loadedProject) loadCommands(this)
					})
				)
			}
		)

		App.getApp().then(async (app) => {
			await app.projectManager.projectReady.fired

			this.disposables.push(
				app.projectManager.forEachProject((project) => {
					this.disposables.push(
						project.fileSave.any.on(([filePath]) => {
							// Whenever a custom command gets saved, we need to update the token provider to account for a potential custom command name change
							if (
								App.fileType.getId(filePath) === 'customCommand'
							)
								loadCommands(this)
						})
					)
				}),
				disposable
			)

			const project = app.project
			if (!(project instanceof BedrockProject)) return

			this.validator = new CommandValidator(project.commandData)
		})
	}

	onModelAdded(model: editor.ITextModel) {
		const isLangFor = super.onModelAdded(model)
		if (!isLangFor) return false

		loadCommands(this)

		return true
	}

	async validate(model: editor.IModel) {
		if (this.validator == undefined) return

		const { editor } = await useMonaco()

		const diagnostics = await this.validator.parse(model.getValue())

		editor.setModelMarkers(model, this.id, diagnostics)
	}
}
