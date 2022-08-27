import {
	tokenizeCommand,
	tokenizeTargetSelector,
	castType,
} from 'bridge-common-utils'
import { CommandData, ICommandArgument } from './Data'
import type { editor } from 'monaco-editor'
import { useMonaco } from '/@/utils/libs/useMonaco'
import { RefSchema } from '/@/components/JSONSchema/Schema/Ref'
import { LocaleManager } from '/@/components/Locales/Manager'

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
								message:
									LocaleManager.translate(
										'validation.mcfunction.unkown_schema.part1'
									) +
									argument.word +
									LocaleManager.translate(
										'validation.mcfunction.unkown_schema.part2'
									),
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

	protected async parseScoreData(token: string): Promise<boolean> {
		if (!token.startsWith('{')) return false

		if (!token.endsWith('}')) return false

		let pieces = token.substring(1, token.length - 1).split(',')

		// Check for weird comma syntax ex: ,,
		if (pieces.find((argument) => argument == '') != undefined) return false

		for (const piece of pieces) {
			const scoreName = piece.split('=')[0]
			const scoreValue = piece.split('=').slice(1).join('=')

			if (scoreValue == undefined) return false

			let argumentType = await this.commandData.isArgumentType(
				scoreValue,
				{
					argumentName: 'scoreData',
					description: 'scoreDataParser',
					type: 'integerRange',
					isOptional: false,
				}
			)

			if (argumentType != 'full') return false
		}

		return true
	}

	protected async parseSelector(selectorToken: {
		startColumn: number
		endColumn: number
		word: string
	}): Promise<{
		passed: boolean
		diagnostic?: editor.IMarkerData
		warnings: editor.IMarkerData[]
	}> {
		const { MarkerSeverity } = await useMonaco()

		let warnings: editor.IMarkerData[] = []

		let baseSelector = selectorToken.word.substring(0, 2)

		// Check for base selector, we later check @i to be @initiator
		if (!['@a', '@p', '@r', '@e', '@s', '@i'].includes(baseSelector))
			return {
				passed: false,
				diagnostic: {
					severity: MarkerSeverity.Error,
					message: `Invalid selector base "${baseSelector}"`,
					startLineNumber: -1,
					startColumn: selectorToken.startColumn + 1,
					endLineNumber: -1,
					endColumn: selectorToken.endColumn + 1,
				},
				warnings: [],
			}

		if (
			baseSelector == '@i' &&
			selectorToken.word.substring(0, '@initiator'.length) != '@initiator'
		)
			return {
				passed: false,
				diagnostic: {
					severity: MarkerSeverity.Error,
					message: `Invalid selector base "${baseSelector}"`,
					startLineNumber: -1,
					startColumn: selectorToken.startColumn + 1,
					endLineNumber: -1,
					endColumn: selectorToken.endColumn + 1,
				},
				warnings: [],
			}

		// If the selector is merely the base we can just pass
		if (baseSelector == selectorToken.word)
			return {
				passed: true,
				warnings: [],
			}

		if (selectorToken.word[baseSelector.length] != '[')
			return {
				passed: false,
				diagnostic: {
					severity: MarkerSeverity.Error,
					message: `Unexpected symbol "${
						selectorToken.word[baseSelector.length]
					}". Expected "["`,
					startLineNumber: -1,
					startColumn: selectorToken.startColumn + 1,
					endLineNumber: -1,
					endColumn: selectorToken.endColumn + 1,
				},
				warnings: [],
			}

		if (!selectorToken.word.endsWith(']'))
			return {
				passed: false,
				diagnostic: {
					severity: MarkerSeverity.Error,
					message: `Unexpected symbol "${
						selectorToken.word[selectorToken.word.length - 1]
					}". Expected "]"`,
					startLineNumber: -1,
					startColumn: selectorToken.startColumn + 1,
					endLineNumber: -1,
					endColumn: selectorToken.endColumn + 1,
				},
				warnings: [],
			}

		let selectorArguments = selectorToken.word
			.substring(baseSelector.length + 1, selectorToken.word.length - 1)
			.split(',')

		// Check for weird comma syntax ex: ,,
		if (selectorArguments.find((argument) => argument == '') != undefined)
			return {
				passed: false,
				diagnostic: {
					severity: MarkerSeverity.Error,
					message: `Unexpected symbol ",". Expected a selector argument`,
					startLineNumber: -1,
					startColumn: selectorToken.startColumn + 1,
					endLineNumber: -1,
					endColumn: selectorToken.endColumn + 1,
				},
				warnings: [],
			}

		const selectorArgumentsSchema =
			await this.commandData.getSelectorArgumentsSchema()

		// Store argument names that can't be used multiple times or where not negated when they need to be
		let canNotUseNames = []

		for (const argument of selectorArguments) {
			// Fail if there is for somereason no =
			if (argument.split('=').length - 1 < 1)
				return {
					passed: false,
					diagnostic: {
						severity: MarkerSeverity.Error,
						message: `Expected symbol "="`,
						startLineNumber: -1,
						startColumn: selectorToken.startColumn + 1,
						endLineNumber: -1,
						endColumn: selectorToken.endColumn + 1,
					},
					warnings: [],
				}

			let argumentName = argument.split('=')[0]
			let argumentValue = argument.split('=').slice(1).join('=')

			const argumentSchema = selectorArgumentsSchema.find(
				(schema) => schema.argumentName == argumentName
			)

			if (argumentSchema == undefined)
				return {
					passed: false,
					diagnostic: {
						severity: MarkerSeverity.Error,
						message: `Invalid selector argument "${argumentName}"`,
						startLineNumber: -1,
						startColumn: selectorToken.startColumn + 1,
						endLineNumber: -1,
						endColumn: selectorToken.endColumn + 1,
					},
					warnings: [],
				}

			const negated = argumentValue.startsWith('!')
			const canNotUse = canNotUseNames.includes(argumentName)

			// Fail if negated and shouldn't be
			if (
				negated &&
				(argumentSchema.additionalData == undefined ||
					!argumentSchema.additionalData.supportsNegation)
			)
				return {
					passed: false,
					diagnostic: {
						severity: MarkerSeverity.Error,
						message: `Argument "${argumentName}" does not support negation`,
						startLineNumber: -1,
						startColumn: selectorToken.startColumn + 1,
						endLineNumber: -1,
						endColumn: selectorToken.endColumn + 1,
					},
					warnings: [],
				}

			// Check if this type should not be used again
			if (canNotUse) {
				if (argumentSchema.additionalData == undefined)
					return {
						passed: false,
						diagnostic: {
							severity: MarkerSeverity.Error,
							message: `Argument "${argumentName}" does not support multiple instances`,
							startLineNumber: -1,
							startColumn: selectorToken.startColumn + 1,
							endLineNumber: -1,
							endColumn: selectorToken.endColumn + 1,
						},
						warnings: [],
					}

				if (
					argumentSchema.additionalData.multipleInstancesAllowed ==
					'whenNegated'
				) {
					return {
						passed: false,
						diagnostic: {
							severity: MarkerSeverity.Error,
							message: `Argument "${argumentName}" does not support multiple instances when not all negated`,
							startLineNumber: -1,
							startColumn: selectorToken.startColumn + 1,
							endLineNumber: -1,
							endColumn: selectorToken.endColumn + 1,
						},
						warnings: [],
					}
				}

				return {
					passed: false,
					diagnostic: {
						severity: MarkerSeverity.Error,
						message: `Argument "${argumentName}" does not support multiple instances`,
						startLineNumber: -1,
						startColumn: selectorToken.startColumn + 1,
						endLineNumber: -1,
						endColumn: selectorToken.endColumn + 1,
					},
					warnings: [],
				}
			}

			let argumentType = await this.commandData.isArgumentType(
				argumentValue,
				argumentSchema
			)

			// We need to parse scoreData on its own because the normal argument type checker seems to not work on it
			if (
				argumentSchema.type == 'scoreData' &&
				(await this.parseScoreData(argumentValue))
			)
				argumentType = 'full'

			// Fail if type does not match, NOTE: Should check scoredata in future when implemented
			if (argumentType != 'full') {
				return {
					passed: false,
					diagnostic: {
						severity: MarkerSeverity.Error,
						message: `Invalid selector argument value "${argumentValue}" for argument "${argumentName}"`,
						startLineNumber: -1,
						startColumn: selectorToken.startColumn + 1,
						endLineNumber: -1,
						endColumn: selectorToken.endColumn + 1,
					},
					warnings: [],
				}
			}

			if (argumentSchema.additionalData != undefined) {
				// Fail if there are additional values that are not met
				if (
					argumentSchema.additionalData.values != undefined &&
					!argumentSchema.additionalData.values.includes(
						argumentValue
					)
				) {
					return {
						passed: false,
						diagnostic: {
							severity: MarkerSeverity.Error,
							message: `Invalid selector argument value "${argumentValue}" for argument "${argumentName}"`,
							startLineNumber: -1,
							startColumn: selectorToken.startColumn + 1,
							endLineNumber: -1,
							endColumn: selectorToken.endColumn + 1,
						},
						warnings: [],
					}
				}

				// Warn if unkown schema value
				if (
					argumentSchema.additionalData.schemaReference != undefined
				) {
					const referencePath =
						argumentSchema.additionalData.schemaReference

					const schemaReference = new RefSchema(
						referencePath,
						'$ref',
						referencePath
					).getCompletionItems({})

					if (
						schemaReference.find(
							(reference) => reference.value == argumentValue
						) == undefined
					) {
						warnings.push({
							severity: MarkerSeverity.Warning,
							message: `Unkown schema value "${argumentValue}" for argument "${argumentName}"`,
							startLineNumber: -1,
							startColumn: selectorToken.startColumn + 1,
							endLineNumber: -1,
							endColumn: selectorToken.endColumn + 1,
						})
					}
				}
			}

			if (
				argumentSchema.additionalData == undefined ||
				argumentSchema.additionalData.multipleInstancesAllowed ==
					undefined ||
				argumentSchema.additionalData.multipleInstancesAllowed ==
					'never' ||
				(argumentSchema.additionalData.multipleInstancesAllowed ==
					'whenNegated' &&
					!negated)
			) {
				canNotUseNames.push(argumentName)
			}
		}

		return {
			passed: true,
			warnings,
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

		console.warn('Tokens!')
		console.log(JSON.parse(JSON.stringify(tokens)))

		// Reconstruct JSON because tokenizer doesn't handle this well
		for (let i = 0; i < tokens.length; i++) {
			if (tokens[i - 1] != undefined) {
				// if we get a case where tokens are like "property", :"value" then we combine them
				if (
					tokens[i].word.startsWith(':') &&
					tokens[i - 1].word[tokens[i - 1].word.length - 1] == '"'
				) {
					tokens.splice(i - 1, 2, {
						startColumn: tokens[i - 1].startColumn,
						endColumn: tokens[i].endColumn,
						word: tokens[i - 1].word + tokens[i].word,
					})

					i--

					continue
				}

				// add the beginning and ending of a json data together
				if (
					tokens[i].word == '}' &&
					tokens[i - 1].word.startsWith('{')
				) {
					tokens.splice(i - 1, 2, {
						startColumn: tokens[i - 1].startColumn,
						endColumn: tokens[i].endColumn,
						word: tokens[i - 1].word + tokens[i].word,
					})

					i--

					continue
				}
			}
		}

		console.warn('Tokens Restructured!')
		console.log(JSON.parse(JSON.stringify(tokens)))

		const commandName = tokens[0]

		// If first word is emtpy then this is an empty line
		if (commandName.word == '') return diagnostics

		if (
			!(await this.commandData.allCommands()).includes(commandName.word)
		) {
			diagnostics.push({
				severity: MarkerSeverity.Error,
				message:
					LocaleManager.translate(
						'validation.mcfunction.unknown_command.part1'
					) +
					commandName.word +
					LocaleManager.translate(
						'validation.mcfunction.unknown_command.part2'
					),
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
				message:
					LocaleManager.translate(
						'validation.mcfunction.missing_parameters.part1'
					) +
					commandName.word +
					LocaleManager.translate(
						'validation.mcfunction.missing_parameters.part2'
					),
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
			let failedLongest = false

			let definitionWarnings: editor.IMarkerData[] = []
			let definitionDiagnostics: editor.IMarkerData[] = []

			// Loop over every token that is not the command name
			let targetArgumentIndex = 0
			for (let k = 1; k < tokens.length; k++) {
				// Fail if there are not enough arguments in definition
				if (definitions[j].arguments.length <= targetArgumentIndex) {
					definitions.splice(j, 1)

					j--

					if (lastTokenError < k) {
						failedLongest = true

						lastTokenError = k
					}

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

						if (lastTokenError < k) {
							failedLongest = true

							lastTokenError = k
						}

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

					if (lastTokenError < k) {
						failedLongest = true

						lastTokenError = k
					}

					failed = true

					break
				}

				// Validate selector but don't completely fail if selector fail so rest of command can validate as well
				if (targetArgument.type == 'selector') {
					const result = await this.parseSelector(argument)

					if (result.diagnostic != undefined)
						definitionDiagnostics.push(result.diagnostic)

					definitionWarnings = definitionWarnings.concat(
						result.warnings
					)
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

						if (lastTokenError < k) {
							failedLongest = true

							lastTokenError = k
						}

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
								message:
									LocaleManager.translate(
										'validation.mcfunction.unkown_schema.part1'
									) +
									argument.word +
									LocaleManager.translate(
										'validation.mcfunction.unkown_schema.part2'
									),
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
			if (failed) {
				if (failedLongest) diagnostics = definitionDiagnostics

				continue
			}

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
				message:
					LocaleManager.translate(
						'validation.mcfunction.invalid_argument.part1'
					) +
					tokens[lastTokenError].word +
					LocaleManager.translate(
						'validation.mcfunction.invalid_argument.part2'
					),
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
