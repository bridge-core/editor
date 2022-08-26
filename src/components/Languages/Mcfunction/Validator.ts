import {
	tokenizeCommand,
	tokenizeTargetSelector,
	castType,
} from 'bridge-common-utils'
import { CommandData, ICommandArgument } from './Data'
import type { editor } from 'monaco-editor'
import { useMonaco } from '/@/utils/libs/useMonaco'
import { RefSchema } from '/@/components/JSONSchema/Schema/Ref'

export class CommandValidator {
	protected commandData: CommandData

	constructor(commandData: CommandData) {
		this.commandData = commandData
	}

	protected async parseSubcommand(
		baseCommandName: string,
		leftTokens: {
			startColumn: number
			endColumn: number
			word: string
		}[]
	): Promise<{
		passed: boolean
		argumentsConsumedCount?: number | undefined
		warnings: editor.IMarkerData[]
	}> {
		const { MarkerSeverity } = await useMonaco()

		const subcommandName = leftTokens[0]

		let subcommandDefinitions = (
			await this.commandData.getSubcommands(baseCommandName)
		).filter((definition) => definition.commandName == subcommandName.word)

		if (subcommandDefinitions.length == 0)
			return {
				passed: false,
				warnings: [],
			}

		let passedSubcommandDefinition = undefined

		let warnings: editor.IMarkerData[] = []

		// Loop over every subcommand definition to check for a matching one
		for (const definition of subcommandDefinitions) {
			let definitionWarnings = []

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
					failed = true

					break
				}

				if (targetArgument.additionalData != undefined) {
					// Fail if there are additional values that are not met
					if (
						targetArgument.additionalData.values != undefined &&
						!targetArgument.additionalData.values.includes(
							argument.word
						)
					) {
						failed = true

						break
					}

					// Warn if unkown schema value
					if (
						targetArgument.additionalData.schemaReference !=
						undefined
					) {
						const referencePath =
							targetArgument.additionalData.schemaReference

						const schemaReference = new RefSchema(
							referencePath,
							'$ref',
							referencePath
						).getCompletionItems({})

						if (
							schemaReference.find(
								(reference) => reference.value == argument.word
							) == undefined
						) {
							definitionWarnings.push({
								severity: MarkerSeverity.Warning,
								message: `Unkown schema value "${argument.word}"`,
								startLineNumber: -1,
								startColumn: argument.startColumn + 1,
								endLineNumber: -1,
								endColumn: argument.endColumn + 1,
							})
						}
					}
				}
			}

			// Only add definition if it is longer since it's the most likely correct one
			if (
				!failed &&
				(passedSubcommandDefinition == undefined ||
					passedSubcommandDefinition.arguments.length <
						definition.arguments.length)
			) {
				passedSubcommandDefinition = definition
				warnings = definitionWarnings
			}
		}

		if (passedSubcommandDefinition == undefined) {
			return {
				passed: false,
				warnings: [],
			}
		} else {
			return {
				passed: true,
				argumentsConsumedCount:
					passedSubcommandDefinition.arguments.length,
				warnings,
			}
		}
	}

	protected async parseCommand(
		line: string | undefined,
		tokens: any[],
		offset: number
	): Promise<editor.IMarkerData[]> {
		const { MarkerSeverity } = await useMonaco()

		let diagnostics: editor.IMarkerData[] = []
		let warnings: editor.IMarkerData[] = []

		if (line != undefined) tokens = tokenizeCommand(line).tokens

		const commandName = tokens[0]

		// If first word is emtpy then this is an empty line
		if (commandName.word == '') return diagnostics

		if (
			!(await this.commandData.allCommands()).includes(commandName.word)
		) {
			diagnostics.push({
				severity: MarkerSeverity.Error,
				message: `Command "${commandName.word}" does not exist`,
				startLineNumber: -1,
				startColumn: commandName.startColumn + 1,
				endLineNumber: -1,
				endColumn: commandName.endColumn + 1,
			})

			// The command is not valid; it makes no sense to continue validating this line
			return diagnostics
		}

		console.log(`Validating command ${commandName.word}!`)

		// Remove empty tokens as to not confuse the argument checker
		tokens = tokens.filter((token) => token.word != '')

		if (tokens.length < 2) {
			diagnostics.push({
				severity: MarkerSeverity.Error,
				message: `Command "${commandName.word}" needs parameters`,
				startLineNumber: -1,
				startColumn: commandName.startColumn + 1,
				endLineNumber: -1,
				endColumn: commandName.endColumn + 1,
			})

			// The command is not valid; it makes no sense to continue validating this line
			return diagnostics
		}

		let definitions = await this.commandData.getCommandDefinitions(
			commandName.word,
			false
		)

		// We only need to record the error of the most farthest in token because that is the most likely variation the user was attempting to type
		let lastTokenError = 0

		let longestPassLength = -1

		// Loop over every definition and test for validness
		for (let j = 0; j < definitions.length; j++) {
			console.log(`---- New Definition ---- ${commandName.word}`)

			let requiredArgurmentsCount = 0

			for (
				requiredArgurmentsCount = 0;
				requiredArgurmentsCount < definitions[j].arguments.length;
				requiredArgurmentsCount++
			) {
				if (
					definitions[j].arguments[requiredArgurmentsCount].isOptional
				)
					break
			}

			let failed = false

			let definitionWarnings: editor.IMarkerData[] = []
			let definitionDiagnostics: editor.IMarkerData[] = []

			// Loop over every token that is not the command name
			let targetArgumentIndex = 0
			for (let k = 1; k < tokens.length; k++) {
				// Fail if there are not enough arguments in definition
				if (definitions[j].arguments.length <= targetArgumentIndex) {
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
					`Validating agument of type ${targetArgument.type} onto ${argument.word}!`
				)

				if (targetArgument.type == 'subcommand') {
					const result = await this.parseSubcommand(
						commandName.word,
						tokens.slice(k, tokens.length)
					)

					definitionWarnings = definitionWarnings.concat(
						result.warnings
					)

					if (result.passed) {
						// Skip over tokens consumed in the subcommand validation
						k += result.argumentsConsumedCount!

						// If there allows multiple subcommands keep going untill a subcommand fails
						if (targetArgument.allowMultiple) {
							let nextResult: {
								passed: boolean
								argumentsConsumedCount?: number
								warnings: editor.IMarkerData[]
							} = {
								passed: true,
								argumentsConsumedCount: 0,
								warnings: [],
							}

							while (nextResult.passed) {
								nextResult = await this.parseSubcommand(
									commandName.word,
									tokens.slice(k + 1, tokens.length)
								)

								if (nextResult.passed) {
									definitionWarnings =
										definitionWarnings.concat(
											nextResult.warnings
										)

									k += nextResult.argumentsConsumedCount! + 1
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

				// If we need to validate a command we just validate all the other tokens and returns because we won't
				// need to check any more tokens as they will be consumed within the new command
				if (targetArgument.type == 'command') {
					const leftTokens = tokens.slice(k, tokens.length)

					const result = await this.parseCommand(
						undefined,
						leftTokens,
						offset + targetArgumentIndex
					)

					definitionDiagnostics = definitionDiagnostics.concat(result)

					targetArgumentIndex++

					break
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

				if (targetArgument.additionalData != undefined) {
					// Fail if there are additional values that are not met
					if (
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

					// Warn if unkown schema value
					if (
						targetArgument.additionalData.schemaReference !=
						undefined
					) {
						const referencePath =
							targetArgument.additionalData.schemaReference

						const schemaReference = new RefSchema(
							referencePath,
							'$ref',
							referencePath
						).getCompletionItems({})

						if (
							schemaReference.find(
								(reference) => reference.value == argument.word
							) == undefined
						) {
							definitionWarnings.push({
								severity: MarkerSeverity.Warning,
								message: `Unkown schema value "${argument.word}"`,
								startLineNumber: -1,
								startColumn: argument.startColumn + 1,
								endLineNumber: -1,
								endColumn: argument.endColumn + 1,
							})
						}
					}
				}

				targetArgumentIndex++
			}

			// Skip if already failed in case this leaves an undefined reference
			if (failed) continue

			// Fail if there are not enough tokens to satisfy definition
			if (targetArgumentIndex < requiredArgurmentsCount) {
				definitions.splice(j, 1)

				j--

				if (lastTokenError < tokens.length - 1)
					lastTokenError = tokens.length - 1

				// Continue to not add warnings to the diagnostics
				continue
			}

			if (targetArgumentIndex < longestPassLength) break

			longestPassLength = targetArgumentIndex

			diagnostics = definitionDiagnostics
			warnings = definitionWarnings
		}

		if (definitions.length == 0) {
			diagnostics.push({
				severity: MarkerSeverity.Error,
				message: `Argument "${tokens[lastTokenError].word}" is not valid here`,
				startLineNumber: -1,
				startColumn: tokens[lastTokenError].startColumn + 1,
				endLineNumber: -1,
				endColumn: tokens[lastTokenError].endColumn + 1,
			})

			// Return here since we don't want warnings added
			return diagnostics
		}

		return diagnostics.concat(warnings)
	}

	async parse(content: string) {
		console.log('Validating!')

		// Split content into lines
		const lines = content.split('\n')
		const diagnostics: editor.IMarkerData[] = []

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]
			if (line[0] == '#') continue

			const results = await this.parseCommand(line, [], 0)

			for (const diagnostic of results) {
				diagnostic.startLineNumber = i + 1
				diagnostic.endLineNumber = i + 1

				diagnostics.push(diagnostic)
			}
		}

		return diagnostics
	}
}
