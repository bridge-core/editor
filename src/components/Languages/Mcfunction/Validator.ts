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
		const subcommandName = leftTokens[0]

		let subcommandDefinitions = (
			await this.commandData.getSubcommands(baseCommandName)
		).filter((definition) => definition.commandName == subcommandName.word)

		if (subcommandDefinitions.length == 0)
			return {
				passed: false,
			}

		let passedSubcommandDefinition = undefined

		// Loop over every subcommand definition to check for a matching one
		for (const definition of subcommandDefinitions) {
			let failed = false

			// Fail if there is not enought tokens to satisfy the definition
			if (leftTokens.length - 1 <= definition.arguments.length) {
				continue
			}

			// Loop over every argument
			for (let j = 0; j < definition.arguments.length; j++) {
				const argument = leftTokens[j + 1]
				const targetArgument = definition.arguments[j]

				const argumentType = await this.commandData.isArgumentType(
					argument.word,
					targetArgument
				)

				// Fail if type does not match
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
				passedSubcommandDefinition = definition
			}
		}

		if (passedSubcommandDefinition == undefined) {
			return {
				passed: false,
			}
		} else {
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

			// Remove empty tokens as to not confuse the argument checker
			tokens = tokens.filter((token) => token.word != '')

			if (tokens.length < 2) {
				diagnostics.push({
					severity: MarkerSeverity.Error,
					message: `Command "${commandName.word}" needs parameters`,
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

			// We only need to record the error of the most farthest in token because that is the most likely variation the user was attempting to type
			let lastTokenError = 0

			// Loop over every definition and test for validness
			for (let j = 0; j < definitions.length; j++) {
				let failed = false

				// Loop over every token that is not the command name
				let targetArgumentIndex = 0
				for (let k = 1; k < tokens.length; k++) {
					// Fail if there are not enough arguments in definition
					if (
						definitions[j].arguments.length <= targetArgumentIndex
					) {
						definitions.splice(j, 1)

						j--

						if (lastTokenError < k) lastTokenError = k

						failed = true

						break
					}

					const argument = tokens[k]

					const targetArgument =
						definitions[j].arguments[targetArgumentIndex]

					if (targetArgument.type == 'subcommand') {
						const result = await this.parseSubcommand(
							commandName.word,
							tokens.slice(k, tokens.length)
						)

						if (result.passed) {
							// Skip over tokens consumed in the subcommand validation
							k += result.argumentsConsumedCount!

							// If there allows multiple subcommands keep going untill a subcommand fails
							if (targetArgument.allowMultiple) {
								let nextResult: {
									passed: boolean
									argumentsConsumedCount?: number
								} = {
									passed: true,
									argumentsConsumedCount: 0,
								}

								while (nextResult.passed) {
									nextResult = await this.parseSubcommand(
										commandName.word,
										tokens.slice(k + 1, tokens.length)
									)

									if (nextResult.passed) {
										const origK = k

										k +=
											nextResult.argumentsConsumedCount! +
											1

										console.log(
											`Extra subcommand pushed k to ${k} from ${origK} or ${tokens[k].word} from ${tokens[origK].word}`
										)
									}
								}
							}

							targetArgumentIndex++

							continue
						} else {
							// Fail because subcommand doesn't match any definitions
							definitions.splice(j, 1)

							j--

							if (lastTokenError < k) lastTokenError = k

							failed = true

							break
						}
					}

					const argumentType = await this.commandData.isArgumentType(
						argument.word,
						targetArgument,
						commandName.word
					)

					// Fail if type does not match
					if (argumentType != 'full') {
						definitions.splice(j, 1)

						j--

						if (lastTokenError < k) lastTokenError = k

						failed = true

						break
					}

					// Fail if there are additional values that are not met
					if (
						targetArgument.additionalData != undefined &&
						targetArgument.additionalData.values != undefined &&
						!targetArgument.additionalData.values.includes(
							argument.word
						)
					) {
						definitions.splice(j, 1)

						j--

						if (lastTokenError < k) lastTokenError = k

						failed = true

						break
					}

					targetArgumentIndex++
				}

				// Skip if already failed in case this leaves an undefined reference
				if (failed) continue

				// Fail if there are not enough tokens to satisfy definition
				if (targetArgumentIndex < definitions[j].arguments.length) {
					definitions.splice(j, 1)

					j--

					if (lastTokenError < tokens.length - 1)
						lastTokenError = tokens.length - 1
				}
			}

			if (definitions.length == 0) {
				diagnostics.push({
					severity: MarkerSeverity.Error,
					message: `Argument "${tokens[lastTokenError].word}" is not valid here`,
					startLineNumber: i + 1,
					startColumn: tokens[lastTokenError].startColumn + 1,
					endLineNumber: i + 1,
					endColumn: tokens[lastTokenError].endColumn + 1,
				})
			}
		}

		return diagnostics
	}
}
