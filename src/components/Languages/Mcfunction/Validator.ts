import {
	tokenizeCommand,
	tokenizeTargetSelector,
	castType,
} from 'bridge-common-utils'
import { CommandData, ICommandArgument } from './Data'
import type { editor } from 'monaco-editor'
import { useMonaco } from '/@/utils/libs/useMonaco'

export class CommandValidator {
	protected commandData: CommandData

	constructor(commandData: CommandData) {
		this.commandData = commandData
	}

	async parseSubcommand(
		baseCommandName: string,
		leftTokens: {
			startColumn: number
			endColumn: number
			word: string
		}[]
	) {
		console.log('Subcommand:')
		console.log(leftTokens)

		const subcommandName = leftTokens[0]

		let subcommandDefinitions = (
			await this.commandData.getSubcommands(baseCommandName)
		).filter((definition) => definition.commandName == subcommandName.word)

		if (subcommandDefinitions.length == 0)
			return {
				passed: false,
			}

		let passedSubcommandDefinition = undefined

		for (const definition of subcommandDefinitions) {
			console.log('Validating Subcommand Definition')
			console.log(definition)

			let failed = false

			for (let j = 0; j < definition.arguments.length; j++) {
				const argument = leftTokens[j + 1]
				const targetArgument = definition.arguments[j]

				console.log(argument)
				console.log(targetArgument)

				const argumentType = await this.commandData.isArgumentType(
					argument.word,
					targetArgument
				)

				if (argumentType != 'full') {
					console.warn(
						`Subcommand: Check against ${argument.word} and ${targetArgument.type} failed!`
					)

					failed = true

					break
				}

				// TODO: Check extra conditions
			}

			if (!failed) {
				console.log(`Subcommand: definition passed!`)
				passedSubcommandDefinition = definition
			}
		}

		if (passedSubcommandDefinition == undefined) {
			console.warn('Subcommand: no definition passed!')

			return {
				passed: false,
			}
		} else {
			console.log('Subcommand: Fully passed!')

			return {
				passed: true,
				argumentsConsumedCount:
					passedSubcommandDefinition.arguments.length,
			}
		}
	}

	async parse(content: string) {
		console.log('Validating!')

		// Split content into lines
		const lines = content.split('\n')
		const diagnostics: editor.IMarkerData[] = []
		const { MarkerSeverity } = await useMonaco()

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]
			if (line[0] == '#') continue

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
					message: `Command "${commandName.word}" does not exist`,
					startLineNumber: i + 1,
					startColumn: commandName.startColumn + 1,
					endLineNumber: i + 1,
					endColumn: commandName.endColumn + 1,
				})

				// The command is not valid; it makes no sense to continue validating this line
				continue
			}

			let definitions = await this.commandData.getCommandDefinitions(
				commandName.word,
				false
			)

			console.log(JSON.parse(JSON.stringify(definitions)))

			// Remove empty tokens as to not confuse the argument checker
			tokens = tokens.filter((token) => token.word != '')

			// If there are too many arguments for all available definitions, throw an error  but only if there is not definition that includes subcommands
			if (
				definitions.find(
					(definition) =>
						definition.arguments.length >= tokens.length - 1
				) == undefined &&
				definitions.find(
					(definition) =>
						definition.arguments.find(
							(argument) => argument.type == 'subcommand'
						) != undefined
				) == undefined
			) {
				diagnostics.push({
					severity: MarkerSeverity.Error,
					message: `Too many arguments for command "${commandName.word}"`,
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

					if (targetArgument.type == 'subcommand') {
						// TODO: Implement Subcommands

						const result = await this.parseSubcommand(
							commandName.word,
							tokens.slice(k, tokens.length)
						)

						console.log('Subcommand result!')
						console.log(result)

						if (result.passed) {
							continue
						} else {
							// Fail because subcommand doesn't match any definitions
							console.warn(
								`Check for subcommand ${argument.word} failed!`
							)

							definitions.splice(j, 1)

							j--

							continue
						}
					}

					const argumentType = await this.commandData.isArgumentType(
						argument.word,
						targetArgument,
						commandName.word
					)

					// Fail if type does not match
					if (argumentType != 'full') {
						console.warn(
							`Check against ${argument.word} and ${targetArgument.type} failed!`
						)

						definitions.splice(j, 1)

						j--

						continue
					}

					// Fail if there are additional values that are not met
					if (
						targetArgument.additionalData != undefined &&
						targetArgument.additionalData.values != undefined &&
						!targetArgument.additionalData.values.includes(
							argument.word
						)
					) {
						console.warn(
							`Invalid value ${argument.word} of ${JSON.stringify(
								targetArgument.additionalData.values
							)}!`
						)

						definitions.splice(j, 1)

						j--

						continue
					}
				}

				if (definitions.length == 0) {
					diagnostics.push({
						severity: MarkerSeverity.Error,
						message: `Argument "${argument.word}" is not valid here`,
						startLineNumber: i + 1,
						startColumn: argument.startColumn + 1,
						endLineNumber: i + 1,
						endColumn: argument.endColumn + 1,
					})

					break
				}
			}
		}

		return diagnostics
	}
}
