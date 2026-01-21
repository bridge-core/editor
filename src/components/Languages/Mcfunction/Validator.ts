import { tokenizeCommand } from 'bridge-common-utils'
import { CommandData } from './Data'
import type { editor } from 'monaco-editor'
import { useMonaco } from '/@/utils/libs/useMonaco'
import { RefSchema } from '/@/components/JSONSchema/Schema/Ref'
import {
	translateWithInsertions as twi,
	translate as t,
} from '/@/components/Locales/Manager'

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
		argumentsConsumedCount?: number
		warnings: editor.IMarkerData[]
		diagnostics: editor.IMarkerData[]
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
				diagnostics: [],
			}

		let passedSubcommandDefinition

		let warnings: editor.IMarkerData[] = []
		let diagnostics: editor.IMarkerData[] = []

		// Loop over every subcommand definition to check for a matching one
		for (const definition of subcommandDefinitions) {
			let definitionDiagnostics: editor.IMarkerData[] = []
			let definitionWarnings: editor.IMarkerData[] = []

			let failed = false

			// Fail if there is not enought tokens to satisfy the definition
			if (leftTokens.length - 1 <= definition.arguments.length) {
				continue
			}

			// Loop over every argument
			for (let j = 0; j < definition.arguments.length; j++) {
				const argument = leftTokens[j + 1]
				const targetArgument = definition.arguments[j]

				let argumentType = await this.commandData.isArgumentType(
					argument.word,
					targetArgument
				)

				if (
					targetArgument.type == 'blockState' &&
					argumentType == 'full' &&
					!(await this.parseBlockState(argument.word))
				)
					argumentType = 'none'

				// Fail if type does not match
				if (
					argumentType != 'full' &&
					(targetArgument.type != 'selector' ||
						!this.parsePlayerName(argument))
				) {
					failed = true

					break
				}

				// Validate selector but don't completely fail if selector fail so rest of command can validate as well
				if (targetArgument.type == 'selector') {
					const result = await this.parseSelector(argument)

					if (result.diagnostic)
						definitionDiagnostics.push(result.diagnostic)

					definitionWarnings = definitionWarnings.concat(
						result.warnings
					)
				}

				if (targetArgument.additionalData) {
					// Fail if there are additional values that are not met
					if (
						targetArgument.additionalData.values &&
						!targetArgument.additionalData.values.includes(
							argument.word
						)
					) {
						failed = true

						break
					}

					// Warn if unknown schema value
					if (targetArgument.additionalData.schemaReference) {
						const referencePath =
							targetArgument.additionalData.schemaReference

						const schemaReference = new RefSchema(
							referencePath,
							'$ref',
							referencePath
						).getCompletionItems({})

						if (
							!schemaReference.find(
								(reference) => reference.value == argument.word
							)
						) {
							definitionWarnings.push({
								severity: MarkerSeverity.Warning,
								message: twi(
									'validation.mcfunction.unknownSchema.name',
									[`"${argument.word}"`]
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
				(!passedSubcommandDefinition ||
					passedSubcommandDefinition.arguments.length <
						definition.arguments.length)
			) {
				passedSubcommandDefinition = definition
				warnings = definitionWarnings
				diagnostics = definitionDiagnostics
			}
		}

		if (!passedSubcommandDefinition) {
			return {
				passed: false,
				warnings: [],
				diagnostics: [],
			}
		} else {
			return {
				passed: true,
				argumentsConsumedCount:
					passedSubcommandDefinition.arguments.length,
				warnings,
				diagnostics,
			}
		}
	}

	protected async parseScoreData(token: string): Promise<boolean> {
		if (!token.startsWith('{')) return false

		if (!token.endsWith('}')) return false

		let pieces = token.substring(1, token.length - 1).split(',')

		// Check for weird comma syntax ex: ,,
		if (pieces.find((argument) => argument == '')) return false

		for (const piece of pieces) {
			const scoreName = piece.split('=')[0]
			let scoreValue = piece.split('=').slice(1).join('=')

			if (!scoreValue) return false

			//Value is negated so remove negation
			if (scoreValue.startsWith('!'))
				scoreValue = scoreValue.substring(1, scoreValue.length)

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

	protected async parseBlockState(token: string): Promise<boolean> {
		if (!token.startsWith('[')) return false

		if (!token.endsWith(']')) return false

		const pieces = token.substring(1, token.length - 1).split(',')

		// Check for weird comma syntax ex: ,,
		if (pieces.find((argument) => argument == '')) return false

		for (const piece of pieces) {
			const scoreName = piece.split('=')[0]
			const scoreValue = piece.split('=').slice(1).join('=')

			if (!scoreValue) return false

			const isString =
				(await this.commandData.isArgumentType(scoreValue, {
					argumentName: 'scoreData',
					description: 'scoreDataParser',
					type: 'string',
					isOptional: false,
				})) == 'full' &&
				(/([a-zA-Z])/.test(scoreValue) || scoreValue == '""') &&
				((scoreValue.startsWith('"') && scoreValue.endsWith('"')) ||
					(!scoreValue.startsWith('"') &&
						!scoreValue.endsWith('"'))) &&
				(scoreValue.split('"').length - 1 == 2 ||
					scoreValue.split('"').length - 1 == 0)

			const isNumber =
				(await this.commandData.isArgumentType(scoreValue, {
					argumentName: 'scoreData',
					description: 'scoreDataParser',
					type: 'number',
					isOptional: false,
				})) == 'full'
			if (!isString && !isNumber) return false
		}

		return true
	}

	protected parsePlayerName(token: {
		startColumn: number
		endColumn: number
		word: string
	}) {
		if (!token.word.startsWith('@')) {
			if (!/[a-zA-Z_0-9]{3,16}/.test(token.word)) return false
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

		if (this.parsePlayerName(selectorToken)) {
			return {
				passed: true,
				warnings,
			}
		}

		let baseSelector = selectorToken.word.substring(0, 2)

		// Check for base selector, we later check @i to be @initiator
		if (!['@a', '@p', '@r', '@e', '@s', '@i'].includes(baseSelector))
			return {
				passed: false,
				diagnostic: {
					severity: MarkerSeverity.Error,
					message: twi(
						'validation.mcfunction.invalidSelectorBase.name',
						[`"${baseSelector}"`]
					),
					startLineNumber: -1,
					startColumn: selectorToken.startColumn + 1,
					endLineNumber: -1,
					endColumn: selectorToken.endColumn + 1,
				},
				warnings: [],
			}

		if (baseSelector == '@i') {
			if (
				selectorToken.word.substring(0, '@initiator'.length) !=
				'@initiator'
			) {
				return {
					passed: false,
					diagnostic: {
						severity: MarkerSeverity.Error,
						message: twi(
							'validation.mcfunction.invalidSelectorBase.name',
							[`"${baseSelector}"`]
						),
						startLineNumber: -1,
						startColumn: selectorToken.startColumn + 1,
						endLineNumber: -1,
						endColumn: selectorToken.endColumn + 1,
					},
					warnings: [],
				}
			}

			baseSelector = '@initiator'
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
					message: twi(
						'validation.mcfunction.unexpectedSymbol.name',
						[`"${selectorToken.word[baseSelector.length]}"`, '"["']
					),
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
					message: twi(
						'validation.mcfunction.unexpectedSymbol.name',
						[`"${selectorToken.word[baseSelector.length]}"`, '"]"']
					),
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
		if (selectorArguments.find((argument) => argument == ''))
			return {
				passed: false,
				diagnostic: {
					severity: MarkerSeverity.Error,
					message: twi(
						'validation.mcfunction.unexpectedSymbol.name',
						[
							`"${selectorToken.word[baseSelector.length]}"`,
							`"${t(
								'validation.mcfunction.tokens.selectorArgument'
							)}"`,
						]
					),
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
						message: twi(
							'validation.mcfunction.unexpectedSymbol.name',
							[`"${argument}"`, `"="`]
						),
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

			if (!argumentSchema)
				return {
					passed: false,
					diagnostic: {
						severity: MarkerSeverity.Error,
						message: twi(
							'validation.mcfunction.invalidSelectorArgument.name',
							[`"${argumentName}"`]
						),
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
				(!argumentSchema.additionalData ||
					!argumentSchema.additionalData.supportsNegation)
			)
				return {
					passed: false,
					diagnostic: {
						severity: MarkerSeverity.Error,
						message: twi(
							'validation.mcfunction.argumentNoSupport.name',
							[
								`"${argumentName}"`,
								t('validation.mcfunction.conditions.negation'),
							]
						),
						startLineNumber: -1,
						startColumn: selectorToken.startColumn + 1,
						endLineNumber: -1,
						endColumn: selectorToken.endColumn + 1,
					},
					warnings: [],
				}

			// Remove ! at the beginning
			if (negated)
				argumentValue = argumentValue.substring(1, argumentValue.length)

			// Check if this type should not be used again
			if (canNotUse) {
				if (!argumentSchema.additionalData)
					return {
						passed: false,
						diagnostic: {
							severity: MarkerSeverity.Error,
							message: twi(
								'validation.mcfunction.argumentNoSupport.name',
								[
									`"${argumentName}"`,
									t(
										'validation.mcfunction.conditions.multipleInstances'
									),
								]
							),
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
							message: twi(
								'validation.mcfunction.argumentNoSupport.bothConditions',
								[`"${argumentName}"`]
							),
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
						message: twi(
							'validation.mcfunction.argumentNoSupport.name',
							[
								`"${argumentName}"`,
								t(
									'validation.mcfunction.conditions.multipleInstances'
								),
							]
						),
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

			if (argumentType != 'full') {
				return {
					passed: false,
					diagnostic: {
						severity: MarkerSeverity.Error,
						message: twi(
							'validation.mcfunction.invalidSelectorArgumentValue.name',
							[`"${argumentValue}"`, `"${argumentName}"`]
						),
						startLineNumber: -1,
						startColumn: selectorToken.startColumn + 1,
						endLineNumber: -1,
						endColumn: selectorToken.endColumn + 1,
					},
					warnings: [],
				}
			}

			if (argumentSchema.additionalData) {
				// Fail if there are additional values that are not met
				if (
					argumentSchema.additionalData.values &&
					!argumentSchema.additionalData.values.includes(
						argumentValue
					)
				) {
					return {
						passed: false,
						diagnostic: {
							severity: MarkerSeverity.Error,
							message: twi(
								'validation.mcfunction.invalidSelectorArgumentValue.name',
								[`"${argumentValue}"`, `"${argumentName}"`]
							),
							startLineNumber: -1,
							startColumn: selectorToken.startColumn + 1,
							endLineNumber: -1,
							endColumn: selectorToken.endColumn + 1,
						},
						warnings: [],
					}
				}

				// Warn if unknown schema value
				if (argumentSchema.additionalData.schemaReference) {
					const referencePath =
						argumentSchema.additionalData.schemaReference

					const schemaReference = new RefSchema(
						referencePath,
						'$ref',
						referencePath
					).getCompletionItems({})

					if (
						!schemaReference.find(
							(reference) => reference.value == argumentValue
						)
					) {
						warnings.push({
							severity: MarkerSeverity.Warning,
							message: twi(
								'validation.mcfunction.unknownSchemaInArgument.name',
								[`"${argumentValue}"`, `"${argumentName}"`]
							),
							startLineNumber: -1,
							startColumn: selectorToken.startColumn + 1,
							endLineNumber: -1,
							endColumn: selectorToken.endColumn + 1,
						})
					}
				}
			}

			if (
				!argumentSchema.additionalData ||
				!argumentSchema.additionalData.multipleInstancesAllowed ||
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

		if (line) tokens = tokenizeCommand(line).tokens

		// Reconstruct JSON because tokenizer doesn't handle this well
		for (let i = 0; i < tokens.length; i++) {
			if (tokens[i - 1]) {
				// if we get a case where tokens are like "property", :"value" then we combine them
				// or if we get a case where tokens are like ["state":"a","state":"b" then we combine them
				// or if we get a case where tokens are like @e[name="Test"] then we combine them
				if (
					(tokens[i].word.startsWith(':') ||
						tokens[i].word.startsWith('=') ||
						tokens[i].word.startsWith(',') ||
						tokens[i].word.startsWith(']')) &&
					tokens[i - 1].word.endsWith('"')
				) {
					tokens.splice(i - 1, 2, {
						startColumn: tokens[i - 1].startColumn,
						endColumn: tokens[i].endColumn,
						word: tokens[i - 1].word + tokens[i].word,
					})

					i--

					continue
				}

				// add the beginning and ending of a json data or scoreData together
				if (
					(tokens[i].word.startsWith('}') &&
						tokens[i - 1].word.startsWith('{')) ||
					(tokens[i].word.startsWith(']') &&
						tokens[i - 1].word.startsWith('['))
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

		const commandName = tokens[0]

		// If first word is empty then this is an empty line
		if (!commandName || commandName.word == '') return diagnostics

		if (
			!(await this.commandData.allCommands()).includes(commandName.word)
		) {
			diagnostics.push({
				severity: MarkerSeverity.Error,
				message: twi('validation.mcfunction.unknownCommand.name', [
					`"${commandName.word}"`,
				]),
				startLineNumber: -1,
				startColumn: commandName.startColumn + 1,
				endLineNumber: -1,
				endColumn: commandName.endColumn + 1,
			})

			// The command is not valid; it makes no sense to continue validating this line
			return diagnostics
		}

		// Remove empty tokens as to not confuse the argument checker
		tokens = tokens.filter((token) => token.word != '')

		if (tokens.length < 2) {
			diagnostics.push({
				severity: MarkerSeverity.Error,
				message: twi('validation.mcfunction.missingArguments.name', [
					`"${commandName.word}"`,
				]),
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
		let lastTokenErrorReason = ''

		let longestPassLength = -1

		// Loop over every definition and test for validness
		for (let j = 0; j < definitions.length; j++) {
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

						lastTokenErrorReason = twi(
							'validation.mcfunction.invalidArgument.name',
							[`"${tokens[k].word}"`]
						)
					}

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

					definitionDiagnostics = definitionDiagnostics.concat(
						result.diagnostics
					)

					if (result.passed) {
						definitionWarnings = definitionWarnings.concat(
							result.warnings
						)

						// Skip over tokens consumed in the subcommand validation
						k += result.argumentsConsumedCount!

						// If there allows multiple subcommands keep going untill a subcommand fails
						if (targetArgument.allowMultiple) {
							let nextResult: {
								passed: boolean
								argumentsConsumedCount?: number
								warnings: editor.IMarkerData[]
								diagnostics: editor.IMarkerData[]
							} = {
								passed: true,
								argumentsConsumedCount: 0,
								warnings: [],
								diagnostics: [],
							}

							while (nextResult.passed) {
								nextResult = await this.parseSubcommand(
									commandName.word,
									tokens.slice(k + 1, tokens.length)
								)

								definitionDiagnostics =
									definitionDiagnostics.concat(
										nextResult.diagnostics
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

							lastTokenErrorReason = twi(
								'validation.mcfunction.invalidArgument.name',
								[`"${tokens[k].word}"`]
							)
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

				let argumentType = await this.commandData.isArgumentType(
					argument.word,
					targetArgument,
					commandName.word
				)

				if (
					targetArgument.type == 'blockState' &&
					argumentType == 'full' &&
					!(await this.parseBlockState(argument.word))
				)
					argumentType = 'none'

				// Fail if type does not match
				if (
					argumentType != 'full' &&
					(targetArgument.type != 'selector' ||
						!this.parsePlayerName(argument))
				) {
					definitions.splice(j, 1)

					j--

					if (lastTokenError < k) {
						failedLongest = true

						lastTokenError = k

						lastTokenErrorReason = twi(
							'validation.mcfunction.invalidArgument.name',
							[`"${tokens[k].word}"`]
						)
					}

					failed = true

					break
				}

				// Validate selector but don't completely fail if selector fail so rest of command can validate as well
				if (targetArgument.type == 'selector') {
					const result = await this.parseSelector(argument)

					if (result.diagnostic)
						definitionDiagnostics.push(result.diagnostic)

					definitionWarnings = definitionWarnings.concat(
						result.warnings
					)
				}

				if (targetArgument.additionalData) {
					// Fail if there are additional values that are not met
					if (
						targetArgument.additionalData.values &&
						!targetArgument.additionalData.values.includes(
							argument.word
						)
					) {
						definitions.splice(j, 1)

						j--

						if (lastTokenError < k) {
							failedLongest = true

							lastTokenError = k

							lastTokenErrorReason = twi(
								'validation.mcfunction.invalidArgument.name',
								[`"${tokens[k].word}"`]
							)
						}

						failed = true

						break
					}

					// Warn if unknown schema value
					if (targetArgument.additionalData.schemaReference) {
						const referencePath =
							targetArgument.additionalData.schemaReference

						const schemaReference = new RefSchema(
							referencePath,
							'$ref',
							referencePath
						).getCompletionItems({})

						if (
							!schemaReference.find(
								(reference) => reference.value == argument.word
							)
						) {
							definitionWarnings.push({
								severity: MarkerSeverity.Warning,
								message: twi(
									'validation.mcfunction.unknownSchema.name',
									[`"${tokens[k].word}"`]
								),
								startLineNumber: -1,
								startColumn: argument.startColumn + 1,
								endLineNumber: -1,
								endColumn: argument.endColumn + 1,
							})
						}
					}
				}

				// Skip back if allow multiple
				if (targetArgument.allowMultiple) targetArgumentIndex--

				targetArgumentIndex++
			}

			// Skip if already failed in case this leaves an undefined reference
			if (failed) {
				if (failedLongest) diagnostics = definitionDiagnostics

				continue
			}

			// Fail if there are not enough tokens to satisfy definition
			if (
				targetArgumentIndex < requiredArgurmentsCount &&
				!definitions[j].arguments[targetArgumentIndex].allowMultiple &&
				targetArgumentIndex < requiredArgurmentsCount - 1
			) {
				definitions.splice(j, 1)

				j--

				if (lastTokenError < tokens.length - 1) {
					lastTokenError = tokens.length - 1

					lastTokenErrorReason = twi(
						'validation.mcfunction.missingArguments.name',
						[`"${commandName.word}"`]
					)
				}

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
				message: lastTokenErrorReason,
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
