import { SmartError } from './Error'
import { SmartWarning } from './Warning'
import { RefSchema } from '/@/components/JSONSchema/Schema/Ref'
import { Token } from './Token'
import { BedrockProject } from '/@/components/Projects/Project/BedrockProject'
import { markRaw } from '@vue/composition-api'
import { SchemaManager } from '/@/components/JSONSchema/Manager'
import { App } from '/@/App'

export class FunctionValidator {
	protected validCommands: Array<string> = []
	protected validSelectorArgs: Array<string> = []
	protected commandData: any | undefined
	protected generalCommandData: any | undefined
	protected generalSelectorArgsData: any | undefined

	public loadedCommandData = false

	public blockStateData: any | undefined

	constructor() {}

	protected DoesStringArrayMatchArray<Bollean>(
		array1: Array<string>,
		array2: Array<string>
	) {
		if (array1.length != array2.length) {
			return false
		}

		for (let i = 0; i < array1.length; i++) {
			if (array1[i] != array2[i]) {
				return false
			}
		}

		return true
	}

	protected LateLoadData() {
		setTimeout(() => {
			if (!this.blockStateData) {
				let blockStateDataLoaded = markRaw(
					SchemaManager.request(
						'file:///data/packages/minecraftBedrock/schema/general/vanilla/blockState.json'
					)
				)

				if (blockStateDataLoaded.type) {
					this.blockStateData = blockStateDataLoaded
				} else {
					this.LateLoadData()
				}
			}
		}, 1000)
	}

	public async LoadCommandData() {
		this.loadedCommandData = true

		const app = await App.getApp()
		const project = await app.project

		if (project instanceof BedrockProject) {
			this.commandData = project.commandData
		}

		this.validCommands = []
		this.validSelectorArgs = []

		this.generalCommandData = []
		this.generalSelectorArgsData = []

		let foundTypes: string[] = []

		if (this.commandData) {
			for (let v = 0; v < this.commandData._data.vanilla.length; v++) {
				const vanilla = this.commandData._data.vanilla[v]

				for (let i = 0; i < vanilla.commands.length; i++) {
					if (
						!this.validCommands.includes(
							vanilla.commands[i].commandName
						)
					) {
						this.validCommands.push(vanilla.commands[i].commandName)
					}

					this.generalCommandData.push(markRaw(vanilla.commands[i]))
				}

				if (vanilla.selectorArguments) {
					for (let i = 0; i < vanilla.selectorArguments.length; i++) {
						if (
							!this.validSelectorArgs.includes(
								vanilla.selectorArguments[i].argumentName
							)
						) {
							this.validSelectorArgs.push(
								vanilla.selectorArguments[i].argumentName
							)
						}

						this.generalSelectorArgsData.push(
							markRaw(vanilla.selectorArguments[i])
						)
					}
				}
			}
		} else {
			console.error('Unable to load commands.json')
		}

		let blockStateDataLoaded = markRaw(
			SchemaManager.request(
				'file:///data/packages/minecraftBedrock/schema/general/vanilla/blockState.json'
			)
		)

		if (blockStateDataLoaded.type) {
			this.blockStateData = blockStateDataLoaded
		} else {
			this.LateLoadData()
		}
	}

	public async GetDocs<String>(command: string = '') {
		if (this.commandData) {
			for (let i = 0; i < this.generalCommandData.length; i++) {
				if (this.generalCommandData[i].commandName == command) {
					return this.generalCommandData[i].description
				}
			}
		} else {
			console.error('Unable to load commands.json')
		}

		return 'Unable to get docs for this command!'
	}

	protected isInt(n: string) {
		return /^-?\d+$/.test(n)
	}

	protected isFloat(n: string) {
		return /^\d+\.\d+$/.test(n)
	}

	specialSymbols = [
		'[',
		']',
		'!',
		'=',
		'@',
		'~',
		'^',
		'!',
		',',
		'{',
		'}',
		'.',
		':',
	]

	whiteSpace = [' ', '\t', '\n', '\r']

	selectorTargets = ['a', 's', 'p', 'r', 'e']

	protected ParseDirty(dirtyString: Token) {
		let readStart = 0
		let readEnd = dirtyString.value.length

		let foundTokens: Token[] = []

		let lastUnexpected = -1

		while (readStart < dirtyString.value.length) {
			let found = false
			let added = true
			let shouldCombine = false

			while (readEnd > readStart && !found) {
				let read = dirtyString.value.substring(readStart, readEnd)

				if (this.specialSymbols.includes(read)) {
					foundTokens.push(
						new Token(read, 'Symbol', readStart, readEnd)
					)
					found = true
				} else if (this.isInt(read)) {
					foundTokens.push(
						new Token(read, 'Integer', readStart, readEnd)
					)
					found = true
					shouldCombine = true
				} else if (this.isFloat(read)) {
					foundTokens.push(
						new Token(read, 'Float', readStart, readEnd)
					)
					found = true
				} else if (read == 'true' || read == 'false') {
					foundTokens.push(
						new Token(read, 'Boolean', readStart, readEnd)
					)
					found = true
				} else if (read == ' ') {
					foundTokens.push(
						new Token(read, 'Space', readStart, readEnd)
					)
					found = true
				}

				readEnd--
			}

			if (found) {
				if (lastUnexpected != -1) {
					if (added) {
						if (shouldCombine) {
							let whatToAdd =
								foundTokens[foundTokens.length - 1].value

							foundTokens.splice(
								foundTokens.length - 1,
								1,
								new Token(
									dirtyString.value.substring(
										lastUnexpected,
										readStart
									) + whatToAdd,
									'String',
									lastUnexpected,
									readStart + whatToAdd.length
								)
							)
						} else {
							foundTokens.splice(
								foundTokens.length - 1,
								0,
								new Token(
									dirtyString.value.substring(
										lastUnexpected,
										readStart
									),
									'String',
									lastUnexpected,
									readStart
								)
							)
						}
					} else {
						foundTokens.push(
							new Token(
								dirtyString.value.substring(
									lastUnexpected,
									readEnd
								),
								'String',
								lastUnexpected,
								readStart
							)
						)
					}

					lastUnexpected = -1
				}
			} else {
				if (lastUnexpected == -1) {
					lastUnexpected = readStart
				}
			}

			readStart = readEnd + 1
			readEnd = dirtyString.value.length
		}

		if (lastUnexpected != -1) {
			foundTokens.push(
				new Token(
					dirtyString.value.substring(lastUnexpected, readEnd),
					'String',
					lastUnexpected,
					readEnd
				)
			)

			lastUnexpected = -1
		}

		return foundTokens
	}

	protected MatchTypes(currentType: string, targetType: string) {
		if (currentType == targetType) {
			return true
		}

		switch (targetType) {
			case 'string':
				if (currentType == 'String') {
					return true
				}
				break
			case 'number':
				if (currentType == 'Integer') {
					return true
				}
				break
			case 'selector':
				if (
					currentType == 'Selector' ||
					currentType == 'String' ||
					currentType == 'Long String' ||
					currentType == 'Complex Selector'
				) {
					return true
				}
				break
			case 'coordinate':
				if (currentType == 'Integer' || currentType == 'Position') {
					return true
				}
				break
			case 'boolean':
				if (currentType == 'Boolean') {
					return true
				}
				break
			case 'jsonData':
				if (currentType == 'JSON') {
					return true
				}
				break
			case 'scoreData':
				if (currentType == 'Score Data') {
					return true
				}
				break
			case 'Score':
				if (currentType == 'Range' || currentType == 'Integer') {
					return true
				}
				break
			case 'blockState':
				if (currentType == 'Block State') {
					return true
				}
				break
		}

		return false
	}

	protected ValidateSelector(
		tokens: Token[],
		start: number,
		end: number
	): any {
		let errors: SmartError[] = []
		let warnings: SmartError[] = []

		if (tokens.length == 0) {
			errors.push(new SmartError('selectors.emptyComplex', start, end))

			return [errors, warnings]
		}

		let confirmedAtributes: string[] = []

		for (let i = 0; i < tokens.length / 4; i++) {
			const offset = i * 4

			if (tokens[offset].type != 'String') {
				errors.push(
					new SmartError(
						'selectors.expectedStringAsAttribute',
						tokens[offset].start,
						tokens[offset].end
					)
				)

				return [errors, warnings]
			}

			let targetAtribute = tokens[offset].value
			let found = false
			let argData = null

			for (let j = 0; j < this.generalSelectorArgsData.length; j++) {
				const selectorArgument = this.generalSelectorArgsData[j]

				if (selectorArgument.argumentName == targetAtribute) {
					argData = selectorArgument
					found = true
					break
				}
			}

			if (!found) {
				errors.push(
					new SmartError(
						[
							'selectors.invalidSelectorAttribute.part1',
							'$' + targetAtribute,
							'selectors.invalidSelectorAttribute.part2',
						],
						tokens[offset].start,
						tokens[offset].end
					)
				)

				return [errors, warnings]
			}

			if (1 + offset >= tokens.length) {
				errors.push(
					new SmartError(
						'common.expectedEquals',
						tokens[offset].start,
						tokens[offset].end
					)
				)

				return [errors, warnings]
			}

			if (
				!(tokens[1 + offset].value == '=' && tokens[1].type == 'Symbol')
			) {
				errors.push(
					new SmartError(
						'common.expectedEquals',
						tokens[offset + 1].start,
						tokens[offset + 1].end
					)
				)

				return [errors, warnings]
			}

			if (2 + offset >= tokens.length) {
				errors.push(
					new SmartError(
						'common.expectedValue',
						tokens[offset + 1].start,
						tokens[offset + 1].end
					)
				)

				return [errors, warnings]
			}

			let negated = false
			let value = tokens[2 + offset]

			if (
				tokens[2 + offset].value == '!' &&
				tokens[2 + offset].type == 'Symbol'
			) {
				value = tokens[3 + offset]
				negated = true
			}

			if (argData.additionalData) {
				if (!argData.additionalData.supportsNegation && negated) {
					errors.push(
						new SmartError(
							[
								'selectors.unsupportedNegation.part1',
								'$' + targetAtribute,
								'selectors.unsupportedNegation.part2',
							],
							tokens[2 + offset].start,
							value.end
						)
					)

					return [errors, warnings]
				}

				if (
					argData.additionalData.multipleInstancesAllowed ==
						'never' &&
					confirmedAtributes.includes(targetAtribute)
				) {
					errors.push(
						new SmartError(
							[
								'selectors.multipleInstancesNever.part1',
								'$' + targetAtribute,
								'selectors.multipleInstancesNever.part2',
							],
							tokens[offset].start,
							value.end
						)
					)

					return [errors, warnings]
				}

				if (
					argData.additionalData.multipleInstancesAllowed ==
						'whenNegated' &&
					!negated &&
					confirmedAtributes.includes(targetAtribute)
				) {
					errors.push(
						new SmartError(
							[
								'selectors.multipleInstancesNegated.part1',
								'$' + targetAtribute,
								'selectors.multipleInstancesNegated.part1',
							],
							tokens[offset].start,
							value.end
						)
					)

					return [errors, warnings]
				}

				let targetType = argData.type

				if (targetAtribute == 'name') {
					targetType = 'selector'
				}

				if (!this.MatchTypes(value.type, targetType)) {
					errors.push(
						new SmartError(
							[
								'common.expectedType.part1',
								'$' + targetType,
								'common.expectedType.part2',
								'$' + value.type,
								'common.expectedType.part3',
							],
							value.start,
							value.end
						)
					)

					return [errors, warnings]
				}

				if (argData.additionalData.values) {
					if (!argData.additionalData.values.includes(value.value)) {
						errors.push(
							new SmartError(
								[
									'selectors.valueNotValid.part1',
									'$' + value.value,
									'selectors.valueNotValid.part2',
								],
								value.start,
								value.end
							)
						)

						return [errors, warnings]
					}
				}

				if (argData.additionalData.schemaReference) {
					let referencePath = argData.additionalData.schemaReference

					let refSchema = new RefSchema(
						referencePath,
						'$ref',
						referencePath
					)

					let schemaReference = refSchema.getCompletionItems({})

					let foundSchema = false

					for (let j = 0; j < schemaReference.length; j++) {
						if (schemaReference[j].value == value.value) {
							foundSchema = true
						}
					}

					if (!foundSchema) {
						//Warning maybe from wrong addon
						if (targetAtribute == 'family') {
							warnings.push(
								new SmartWarning(
									[
										'schema.familyNotFound.part1',
										'$' + value.value,
										'schema.familyNotFound.part2',
									],
									value.start,
									value.end
								)
							)
						} else if (targetAtribute == 'type') {
							warnings.push(
								new SmartWarning(
									[
										'schema.typeNotFound.part1',
										'$' + value.value,
										'schema.typeNotFound.part2',
									],
									value.start,
									value.end
								)
							)
						} else if (targetAtribute == 'tag') {
							warnings.push(
								new SmartWarning(
									[
										'schema.tagNotFound.part1',
										'$' + value.value,
										'schema.tagNotFound.part2',
									],
									value.start,
									value.end
								)
							)
						} else {
							warnings.push(
								new SmartWarning(
									[
										'schema.schemaValueNotFound.part1',
										'$' + value.value,
										'schema.schemaValueNotFound.part2',
									],
									value.start,
									value.end
								)
							)
						}
					}
				}
			}

			let possibleComaPos = 3

			if (negated) {
				possibleComaPos = 4
			}

			if (possibleComaPos + offset < tokens.length) {
				if (
					!(
						tokens[possibleComaPos + offset].value == ',' &&
						tokens[possibleComaPos + offset].type == 'Symbol'
					)
				) {
					errors.push(
						new SmartError(
							'common.expectedComma',
							tokens[possibleComaPos + offset].start,
							tokens[possibleComaPos + offset].end
						)
					)
					return [errors, warnings]
				}
			}
		}

		return [errors, warnings]
	}

	protected ValidateJSON(tokens: Token[]) {
		let errors: string[] = []
		let warnings: SmartError[] = []

		let reconstructedJSON = '{'

		for (let i = 0; i < tokens.length; i++) {
			if (tokens[i].type == 'Long String') {
				reconstructedJSON += '"' + tokens[i].value + '"'
			} else {
				reconstructedJSON += tokens[i].value
			}
		}

		reconstructedJSON += '}'

		try {
			JSON.parse(reconstructedJSON)
		} catch (e) {
			errors.push('jsonNotValid')
		}

		return [errors, warnings]
	}

	protected ValidateScoreData(
		tokens: Token[],
		start: number,
		end: number
	): any {
		let errors: SmartError[] = []
		let warnings: SmartError[] = []

		if (tokens.length == 0) {
			//Unexpected empty score data
			errors.push(new SmartError('scoreData.empty', start, end))
			return [errors, warnings]
		}

		let confirmedValues: string[] = []

		for (let i = 0; i < tokens.length / 4; i++) {
			const offset = i * 4

			let targetValue = tokens[offset].value

			if (tokens[offset].type != 'String') {
				errors.push(
					new SmartError(
						'scoreData.expectedStringAsAttribute',
						tokens[offset].start,
						tokens[offset].end
					)
				)

				return [errors, warnings]
			}

			if (1 + offset >= tokens.length) {
				errors.push(
					new SmartError(
						'common.expectedEquals',
						tokens[offset].start,
						tokens[offset].end
					)
				)

				return [errors, warnings]
			}

			if (
				!(tokens[1 + offset].value == '=' && tokens[1].type == 'Symbol')
			) {
				errors.push(
					new SmartError(
						'common.expectedEquals',
						tokens[offset + 1].start,
						tokens[offset + 1].end
					)
				)

				return [errors, warnings]
			}

			if (2 + offset >= tokens.length) {
				errors.push(
					new SmartError(
						'common.expectedValue',
						tokens[offset + 1].start,
						tokens[offset + 1].end
					)
				)

				return [errors, warnings]
			}

			let value = tokens[2 + offset]

			if (!this.MatchTypes(value.type, 'Score')) {
				errors.push(
					new SmartError(
						[
							'scoreData.invalidType.part1',
							'$' + value.type,
							'scoreData.invalidType.part2',
						],
						tokens[offset + 2].start,
						tokens[offset + 2].end
					)
				)

				return [errors, warnings]
			}

			if (confirmedValues.includes(value.value)) {
				errors.push(
					new SmartError(
						'scoreData.repeat',
						tokens[offset + 2].start,
						tokens[offset + 2].end
					)
				)

				return [errors, warnings]
			}

			if (3 + offset < tokens.length) {
				if (
					!(
						tokens[3 + offset].value == ',' &&
						tokens[3 + offset].type == 'Symbol'
					)
				) {
					errors.push(
						new SmartError(
							'common.expectedComa',
							tokens[offset + 3].start,
							tokens[offset + 3].end
						)
					)

					return [errors, warnings]
				}
			}

			confirmedValues.push(targetValue)
		}

		return [errors, warnings]
	}

	protected ValidateBlockState(tokens: Token[]) {
		let errors: string[] = []
		let warnings: SmartError[] = []

		if (tokens.length == 0) {
			//Empty Block States Are Supported!
			return [errors, warnings]
		}

		let confirmedValues: string[] = []

		for (let i = 0; i < tokens.length / 4; i++) {
			const offset = i * 4

			let targetValue = tokens[0 + offset].value

			if (tokens[0 + offset].type != 'Long String') {
				errors.push('blockStateExpectedLongStringAsValue')
				return [errors, warnings]
			}

			if (1 + offset >= tokens.length) {
				//Error expected ':'
				errors.push('expectedColonButNothing')
				return [errors, warnings]
			}

			if (
				!(tokens[1 + offset].value == ':' && tokens[1].type == 'Symbol')
			) {
				//Error expected ':'
				errors.push('expectedColon')
				return [errors, warnings]
			}

			if (2 + offset >= tokens.length) {
				//Error expected value
				errors.push('expectedValueButNothing')
				return [errors, warnings]
			}

			let value = tokens[2 + offset]

			if (this.blockStateData) {
				let targetData

				let properties = Object.getOwnPropertyNames(
					this.blockStateData.properties
				)

				for (let j = 0; j < properties.length; j++) {
					if (properties[j] == targetValue) {
						targetData = this.blockStateData.properties[
							properties[j]
						]

						targetData['name'] = properties[j]
						break
					}
				}

				let targetValues = targetData.enum

				for (let j = 0; j < targetValues.length; j++) {
					targetValues[j] = targetValues[j].toString()
				}

				if (!targetValues.includes(value.value)) {
					errors.push(
						'invalidBlockStateValue.part1' +
							value.value +
							'invalidBlockStateValue.part2'
					)
					return [errors, warnings]
				}
			}

			if (confirmedValues.includes(value.value)) {
				errors.push('repeatOfBlockState')
				return [errors, warnings]
			}

			if (3 + offset < tokens.length) {
				if (
					tokens[3 + offset].value == ',' &&
					tokens[3 + offset].type == 'Symbol'
				) {
					//Error expected ','
					errors.push('expectedComa')
					return [errors, warnings]
				}
			}

			confirmedValues.push(targetValue)
		}

		return [errors, warnings]
	}

	public ValidateCommand<Array>(
		command: string | null,
		commandTokens: Token[] | null = null
	) {
		let errors: SmartError[] = []
		let warnings: any[] = []

		if (!this.blockStateData) {
			warnings.push(new SmartWarning('data.missingData', 0, 0))
		}

		//Seperate into strings by quotes for parsing

		let splitStrings

		let inString = false

		let tokens: Token[] = []

		let baseCommand: Token

		if (!commandTokens) {
			splitStrings = command!.split('"')

			let lastChange = -1

			for (let i = 0; i < splitStrings.length; i++) {
				if (!inString) {
					let tokenStart = 0

					if (tokens.length > 0) {
						tokenStart = tokens[tokens.length - 1].end + 1
					}

					tokens.push(
						new Token(
							splitStrings[i],
							'Dirty',
							tokenStart,
							tokenStart + splitStrings[i].length
						)
					)
				} else {
					let tokenStart = 0

					if (tokens.length > 0) {
						tokenStart = tokens[tokens.length - 1].end + 1
					}

					tokens.push(
						new Token(
							splitStrings[i],
							'Long String',
							tokenStart,
							tokenStart + splitStrings[i].length
						)
					)
				}

				inString = !inString
				lastChange = i
			}

			if (!inString) {
				errors.push(
					new SmartError(
						'common.unclosedString',
						tokens[lastChange].start,
						tokens[tokens.length - 1].end
					)
				)
				return [errors, warnings]
			}

			//Tokenize strings for validation

			for (let i = 0; i < tokens.length; i++) {
				if (tokens[i].type == 'Dirty') {
					let parsedTokens: Token[] = this.ParseDirty(tokens[i])

					for (let j = 0; j < parsedTokens.length; j++) {
						tokens.splice(i + j + 1, 0, parsedTokens[j])
					}

					tokens.splice(i, 1)

					i += parsedTokens.length - 1
				}
			}

			if (tokens.length > 0) {
				if (tokens[0].type == 'Space') {
					errors.push(
						new SmartError(
							'common.spaceAtStart',
							tokens[lastChange].start,
							tokens[lastChange].end
						)
					)

					return [errors, warnings]
				}

				if (tokens.length == 0) {
					errors.push(new SmartError('commands.empty'))

					return [errors, warnings]
				}

				baseCommand = tokens[0]

				//Test for basic command
				baseCommand = tokens.shift()!

				if (!this.validCommands.includes(baseCommand.value)) {
					errors.push(
						new SmartError(
							'command.invalid.part1' +
								baseCommand.value +
								'command.invalid.part2',
							baseCommand.start,
							baseCommand.end
						)
					)

					return [errors, warnings]
				}

				//Construct Identifiers
				for (let i = 0; i < tokens.length; i++) {
					const token = tokens[i]

					if (token.type == 'Symbol' && token.value == ':') {
						if (i + 1 >= tokens.length) {
							errors.push(
								new SmartError(
									'common.exptectedColon',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						}

						if (i - 1 < 0) {
							errors.push(
								new SmartError(
									'identifiers.missingNamespace',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						}

						if (tokens[i - 1].type == 'Space') {
							errors.push(
								new SmartError(
									'identifiers.missingNamespace',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						}

						let firstValue = tokens[i - 1]
						let secondValue = tokens[i + 1]

						if (
							firstValue.type == 'String' &&
							secondValue.type == 'String'
						) {
							tokens[i - 1] = new Token(
								firstValue.value + ':' + secondValue.value,
								'String'
							)

							tokens.splice(i, 2)
						}
					}
				}

				//Remove Spaces
				for (let i = 0; i < tokens.length; i++) {
					const token = tokens[i]

					if (token.type == 'Space') {
						tokens.splice(i, 1)
						i--
					}
				}

				//Construct Positions
				for (let i = 0; i < tokens.length; i++) {
					const token = tokens[i]

					if (
						token.type == 'Symbol' &&
						(token.value == '~' || token.value == '^')
					) {
						if (i + 1 < tokens.length) {
							let numberTarget = tokens[i + 1]

							if (numberTarget.type == 'Integer') {
								tokens[i] = new Token(
									token.value + numberTarget.value,
									'Position'
								)

								tokens.splice(i + 1, 1)
							} else {
								tokens[i] = new Token(token.value, 'Position')
							}
						}

						tokens[i] = new Token(token.value, 'Position')
					}
				}

				//Construct json
				let inJSON = false
				let JSONToReconstruct: Token[] = []

				for (let i = 0; i < tokens.length; i++) {
					const token = tokens[i]

					if (token.type == 'Symbol' && token.value == '{') {
						if (inJSON) {
							errors.push(
								new SmartError(
									'common.unexpectedOpenBracket',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						} else {
							inJSON = true
						}
					} else if (token.type == 'Symbol' && token.value == '}') {
						if (inJSON) {
							inJSON = false

							let result = this.ValidateJSON(JSONToReconstruct)

							if (result[0].length == 0) {
								let startingPoint =
									i - JSONToReconstruct.length - 1

								tokens.splice(
									startingPoint,
									JSONToReconstruct.length + 2,
									(tokens[startingPoint] = new Token(
										tokens[startingPoint].value,
										'JSON'
									))
								)
							}

							JSONToReconstruct = []
						} else {
							errors.push(
								new SmartError(
									'common.unexpectedClosedCurlyBracket',
									token.start,
									token.end
								)
							)
							return [errors, warnings]
						}
					} else {
						if (inJSON) {
							JSONToReconstruct.push(token)
						}
					}
				}

				//Construct ranges
				for (let i = 0; i < tokens.length; i++) {
					const token = tokens[i]

					if (token.type == 'Symbol' && token.value == '.') {
						if (i + -1 < 0) {
							errors.push(
								new SmartError(
									'ranges.missingFirstNumber',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						}

						if (i + 1 >= tokens.length) {
							errors.push(
								new SmartError(
									'ranges.missingDot',
									tokens[i - 1].start,
									token.end
								)
							)

							return [errors, warnings]
						}

						if (i + 2 >= tokens.length) {
							errors.push(
								new SmartError(
									'ranges.missingSecondNumber',
									tokens[i - 1].start,
									tokens[i + 1].end
								)
							)

							return [errors, warnings]
						}

						let firstNum = tokens[i - 1]
						let secondNum = tokens[i + 2]
						let dot = tokens[i + 1]

						if (firstNum.type != 'Integer') {
							errors.push(
								new SmartError(
									'ranges.missingFirstNumber',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						}

						if (!(dot.value == '.' && dot.type == 'Symbol')) {
							errors.push(
								new SmartError(
									'ranges.missingDot',
									tokens[i - 1].start,
									token.end
								)
							)

							return [errors, warnings]
						}

						if (secondNum.type != 'Integer') {
							errors.push(
								new SmartError(
									'ranges.missingSecondNumber',
									tokens[i - 1].start,
									tokens[i + 1].end
								)
							)

							return [errors, warnings]
						}

						tokens[i - 1] = new Token(
							firstNum.value + ' ' + secondNum.value,
							'Range'
						)

						tokens.splice(i, 3)
					}
				}

				//Construct Score Data
				let inScoreData = false
				let scoreDataToReconstruct: Token[] = []

				let startBracketPos = 0
				let endBracketPos = 0

				for (let i = 0; i < tokens.length; i++) {
					const token = tokens[i]

					if (token.type == 'Symbol' && token.value == '{') {
						if (inScoreData) {
							errors.push(
								new SmartError(
									'common.unexpectedOpenCurlyBracket',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						} else {
							inScoreData = true

							startBracketPos = token.start
						}
					} else if (token.type == 'Symbol' && token.value == '}') {
						if (inScoreData) {
							inScoreData = false

							endBracketPos = token.end

							let result = this.ValidateScoreData(
								scoreDataToReconstruct,
								startBracketPos,
								endBracketPos
							)

							errors = errors.concat(result[0])
							warnings = warnings.concat(result[1])

							if (errors.length > 0) {
								return [errors, warnings]
							}

							let startingPoint =
								i - scoreDataToReconstruct.length - 1

							tokens.splice(
								startingPoint,
								scoreDataToReconstruct.length + 2,
								(tokens[startingPoint] = new Token(
									tokens[startingPoint].value,
									'Score Data'
								))
							)

							scoreDataToReconstruct = []
						} else {
							errors.push(
								new SmartError(
									'common.unexpectedClosedCurlyBracket',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						}
					} else {
						if (inScoreData) {
							scoreDataToReconstruct.push(token)
						}
					}
				}

				//Construct Basic Selectors
				for (let i = 0; i < tokens.length; i++) {
					const token = tokens[i]

					if (token.type == 'Symbol' && token.value == '@') {
						if (i + 1 >= tokens.length) {
							errors.push(
								new SmartError(
									'selectors.expectedLetterAfterAt',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						}

						let selectorTarget = tokens[i + 1]

						if (selectorTarget.type != 'String') {
							errors.push(
								new SmartError(
									'selectors.expectedLetterAfterAt',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						}

						if (
							!this.selectorTargets.includes(selectorTarget.value)
						) {
							errors.push(
								new SmartError(
									[
										'selectors.invalid.part1',
										'$' + selectorTarget.value,
										'iselectors.invalid.part2',
									],
									token.start,
									tokens[i + 1].end
								)
							)

							return [errors, warnings]
						}

						tokens[i] = new Token(
							'@' + selectorTarget.value,
							'Selector'
						)

						tokens.splice(i + 1, 1)
					}
				}

				//Construct Block States
				let inBlockState = false
				let blockStateToReconstruct: Token[] = []

				for (let i = 0; i < tokens.length; i++) {
					const token = tokens[i]

					if (token.type == 'Symbol' && token.value == '[') {
						if (inBlockState) {
							errors.push(
								new SmartError(
									'common.unexpectedOpenSquareBracket',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						} else {
							inBlockState = true
						}
					} else if (token.type == 'Symbol' && token.value == ']') {
						if (inBlockState) {
							inBlockState = false

							let result = this.ValidateBlockState(
								blockStateToReconstruct
							)

							warnings = warnings.concat(result[1])

							if (result[0].length == 0) {
								let startingPoint =
									i - blockStateToReconstruct.length - 1

								tokens.splice(
									startingPoint,
									blockStateToReconstruct.length + 2,
									(tokens[startingPoint] = new Token(
										tokens[startingPoint].value,
										'Block State'
									))
								)
							}

							blockStateToReconstruct = []
						} else {
							errors.push(
								new SmartError(
									'common.unexpectedClosedSquareBracket',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						}
					} else {
						if (inBlockState) {
							blockStateToReconstruct.push(token)
						}
					}
				}

				//Construct Complex Selectors
				let inSelector = false
				let selectorToReconstruct: Token[] = []

				startBracketPos = 0
				endBracketPos = 0

				for (let i = 0; i < tokens.length; i++) {
					const token = tokens[i]

					if (token.type == 'Symbol' && token.value == '[') {
						if (inSelector) {
							errors.push(
								new SmartError(
									'common.unexpectedOpenSquareBracket',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						} else {
							if (i - 1 < 0) {
								errors.push(
									new SmartError(
										'identifiers.selectorNotBeforeOpenSquareBracket',
										token.start,
										token.end
									)
								)

								return [errors, warnings]
							}

							if (tokens[i - 1].type != 'Selector') {
								errors.push(
									new SmartError(
										'identifiers.selectorNotBeforeOpenSquareBracket',
										token.start,
										token.end
									)
								)

								return [errors, warnings]
							}

							inSelector = true

							startBracketPos = token.start
						}
					} else if (token.type == 'Symbol' && token.value == ']') {
						if (inSelector) {
							inSelector = false
							endBracketPos = token.end

							let result = this.ValidateSelector(
								selectorToReconstruct,
								startBracketPos,
								endBracketPos
							)

							errors = errors.concat(result[0])
							warnings = warnings.concat(result[1])

							if (errors.length > 0) {
								return [errors, warnings]
							}

							let startingPoint =
								i - selectorToReconstruct.length - 2

							tokens.splice(
								startingPoint,
								selectorToReconstruct.length + 3,
								(tokens[startingPoint] = new Token(
									tokens[startingPoint].value,
									'Complex Selector'
								))
							)

							selectorToReconstruct = []
						} else {
							errors.push(
								new SmartError(
									'common.unexpectedClosedSquareBracket',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						}
					} else {
						if (inSelector) {
							selectorToReconstruct.push(token)
						}
					}
				}
			}
		} else {
			tokens = commandTokens!

			baseCommand = tokens.shift()!
		}

		//Validate Command Argument Types
		let possibleCommandVariations = []

		for (let i = 0; i < this.generalCommandData.length; i++) {
			if (this.generalCommandData[i].commandName == baseCommand!.value) {
				possibleCommandVariations.push(
					this.generalCommandData[i].arguments
				)
			}
		}

		let lastValidVariations: Token[] = Array.from(possibleCommandVariations)

		for (let i = 0; i < tokens.length; i++) {
			const arg = tokens[i]

			for (let j = 0; j < possibleCommandVariations.length; j++) {
				const variation = possibleCommandVariations[j]

				if (variation.length <= i) {
					if (variation[variation.length - 1].type != 'command') {
						possibleCommandVariations.splice(j, 1)
						j--
						continue
					}
				} else {
					if (variation[i].type == 'command') {
						let commandSlicedTokens = tokens.slice(i, tokens.length)

						let result = this.ValidateCommand(
							null,
							commandSlicedTokens
						)

						if (result[0].length > 0) {
							possibleCommandVariations.splice(j, 1)
							j--
						}
					} else {
						if (!this.MatchTypes(arg.type, variation[i].type)) {
							possibleCommandVariations.splice(j, 1)
							j--
						}
					}
				}
			}

			if (possibleCommandVariations.length == 0) {
				errors.push(
					new SmartError(
						[
							'arguments.noneValid.part1',
							'$' + (i + 1),
							'arguments.noneValid.part2',
							'$' + arg.type,
							'arguments.noneValid.part3',
						],
						arg.start,
						arg.end
					)
				)

				return [errors, warnings]
			}

			lastValidVariations = Array.from(possibleCommandVariations)
		}

		//Check for missing and optional parameters
		for (let j = 0; j < possibleCommandVariations.length; j++) {
			const variation = possibleCommandVariations[j]

			if (tokens.length < variation.length) {
				if (!variation[tokens.length].isOptional) {
					possibleCommandVariations.splice(j, 1)
					j--
				}

				continue
			}
		}

		if (possibleCommandVariations.length == 0) {
			errors.push(
				new SmartError(
					[
						'arguments.noneValidEnd.part1',
						'$' + tokens.length,
						'arguments.noneValidEnd.part2',
					],
					tokens[tokens.length - 1].start,
					tokens[tokens.length - 1].end
				)
			)

			return [errors, warnings]
		}

		return [errors, warnings]
	}
}
