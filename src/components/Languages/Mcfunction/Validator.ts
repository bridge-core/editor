import {
	tokenizeCommand,
	tokenizeTargetSelector,
	castType,
} from 'bridge-common-utils'
import { CommandData } from './Data'
import type { editor } from 'monaco-editor'
import { useMonaco } from '/@/utils/libs/useMonaco'

export class CommandValidator {
	protected commandData: CommandData

	constructor(commandData: CommandData) {
		this.commandData = commandData
	}

	getType(word: string) {
		const typedWord = castType(word)
		const type = typeof typedWord

		if (type == 'number') return 'number'

		if (type == 'boolean') return 'boolean'

		return type
	}

	async parse(content: string) {
		console.log('Validating!')

		// Split content into lines
		const lines = content.split('\n')
		const diagnostics: editor.IMarkerData[] = []
		const { MarkerSeverity } = await useMonaco()

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]

			let { tokens } = tokenizeCommand(line)

			const commandName = tokens[0]

			// If first word is emtpy then this is an empty line
			if (commandName.word == '') continue

			if (
				!(await this.commandData.allCommands()).includes(
					commandName.word
				)
			) {
				diagnostics.push({
					severity: MarkerSeverity.Error,
					message: `Command ${commandName.word} not found`,
					startLineNumber: i + 1,
					startColumn: commandName.startColumn + 1,
					endLineNumber: i + 1,
					endColumn: commandName.endColumn + 1,
				})
			}

			let definitions = await this.commandData.getCommandDefinitions(
				commandName.word,
				false
			)

			// Remove empty tokens as to not confuse the argument checker
			tokens = tokens.filter((token) => token.word != '')

			// If there are too many arguments for all available definitions, throw an error
			if (
				definitions.find(
					(definition) =>
						definition.arguments.length >= tokens.length - 1
				) == undefined
			) {
				diagnostics.push({
					severity: MarkerSeverity.Error,
					message: `Too many arguments for command ${commandName.word}`,
					startLineNumber: i + 1,
					startColumn: commandName.startColumn + 1,
					endLineNumber: i + 1,
					endColumn: tokens.at(-1)?.endColumn ?? 1,
				})
			}

			// Check for a valid command definition
			for (let k = 1; k < tokens.length; k++) {
				const argument = tokens[k]

				for (let j = 0; j < definitions.length; j++) {
					if (definitions[j].arguments.length < k) {
						definitions.splice(j, 1)

						j--

						continue
					}

					const targetArgument = definitions[j].arguments[k - 1]
					const argumentType = await this.commandData.isArgumentType(
						argument.word,
						targetArgument,
						commandName.word
					)

					if (argumentType != 'full') {
						definitions.splice(j, 1)

						j--
					}
				}

				if (definitions.length == 0) {
					diagnostics.push({
						severity: MarkerSeverity.Error,
						message: `Argument ${argument.word} not valid here`,
						startLineNumber: i + 1,
						startColumn: argument.startColumn + 1,
						endLineNumber: i + 1,
						endColumn: argument.endColumn + 1,
					})
				}
			}
		}

		return diagnostics
	}
}
