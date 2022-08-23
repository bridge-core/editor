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

			// Fail if there is not enought tokens to satisfy the definition
			console.log('Length check?')
			console.log(leftTokens.length)
			console.log(definition.arguments.length)

			if (leftTokens.length - 1 < definition.arguments.length) {
				continue
			}

			for (let j = 0; j < definition.arguments.length; j++) {
				const argument = leftTokens[j + 1]
				const targetArgument = definition.arguments[j]

				console.log(argument)
				console.log(targetArgument)

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
					if (definitions[j].arguments.length < targetArgumentIndex) {
						console.warn(
							'Failed cause less arguments than target argument index'
						)

						definitions.splice(j, 1)

						j--

						if (lastTokenError < k) lastTokenError = k

						failed = true

						break
					}

					const argument = tokens[k]

					const targetArgument =
						definitions[j].arguments[targetArgumentIndex]

					console.log(
						`Checking ${argument.word} against ${targetArgument.type}`
					)

					if (targetArgument.type == 'subcommand') {
						// TODO: Implement Subcommands
						const result = await this.parseSubcommand(
							commandName.word,
							tokens.slice(k, tokens.length)
						)

						console.log('Subcommand result!')
						console.log(result)

						if (result.passed) {
							k += result.argumentsConsumedCount!

							targetArgumentIndex++

							continue
						} else {
							// Fail because subcommand doesn't match any definitions
							console.warn(
								`Check for subcommand ${argument.word} failed!`
							)

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
						console.warn(
							`Check against ${argument.word} and ${targetArgument.type} failed!`
						)

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
						console.warn(
							`Invalid value ${argument.word} of ${JSON.stringify(
								targetArgument.additionalData.values
							)}!`
						)

						definitions.splice(j, 1)

						j--

						if (lastTokenError < k) lastTokenError = k

						failed = true

						break
					}

					targetArgumentIndex++
				}

				if (failed) continue

				if (targetArgumentIndex < definitions[j].arguments.length) {
					console.warn(
						'Failed because not argument is less than definition argument count'
					)

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
