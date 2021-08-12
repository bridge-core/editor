import { App } from '/@/App'
import { getLocation } from '/@/utils/monaco/getLocation'
import { languages, editor, Position, Range } from 'monaco-editor'
import { getJsonWordAtPosition } from '/@/utils/monaco/getJsonWord'
import { FileType } from '/@/components/Data/FileType'
import { tokenizeCommand } from './tokenize'
import { BedrockProject } from '/@/components/Projects/Project/BedrockProject'
import { isWithinQuotes } from '/@/utils/monaco/withinQuotes'
import { isMatch } from '/@/utils/glob/isMatch'

languages.registerCompletionItemProvider('json', {
	provideCompletionItems: async (
		model: editor.ITextModel,
		position: Position
	) => {
		const app = await App.getApp()
		const project = app.project
		if (!(project instanceof BedrockProject)) return

		const commandData = project.commandData
		const location = getLocation(model, position)
		const currentTab = app.project.tabSystem?.selectedTab
		if (!currentTab) return

		const validCommands: Record<
			string,
			string[]
		> = await app.dataLoader.readJSON(
			`data/packages/minecraftBedrock/location/validCommand.json`
		)
		const {
			id,
			meta: { commandsUseSlash } = { commandsUseSlash: false },
		} = FileType.get(currentTab.getProjectPath()) ?? {
			id: 'unknown',
			meta: { commandsUseSlash: false },
		}
		const locationPatterns = validCommands[id] ?? []

		if (locationPatterns.length === 0) return

		const isCommand = isMatch(location, locationPatterns)
		if (!isCommand || !isWithinQuotes(model, position)) return

		let { word, range } = getJsonWordAtPosition(model, position)

		// e.g. animations/animation controller commands need to start with a slash char
		if (commandsUseSlash && !word.startsWith('/')) return

		let replacedSlash = false
		if (word.startsWith('/')) {
			word = word.slice(1)
			replacedSlash = true
		}

		const { tokens } = tokenizeCommand(word)

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
						Math.min(
							range.endColumn + 1,
							range.startColumn +
								lastToken.startColumn +
								(replacedSlash ? 2 : 1)
						),
						position.lineNumber,
						Math.min(
							range.endColumn + 1,
							position.column + insertText.length
						)
					),
				})
			),
		}
	},
})
