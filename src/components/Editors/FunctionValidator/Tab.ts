import { FileTab } from '/@/components/TabSystem/FileTab'
import FunctionValidatorTabComponent from './Tab.vue'
import { Tab } from '../../TabSystem/CommonTab'
import { App } from '/@/App'
import * as monaco from 'monaco-editor'
import { TabSystem } from '../../TabSystem/TabSystem'
import Error from './Error.vue'
import Warning from './Warning.vue'
import Vue from 'vue'
import { BedrockProject } from '../../Projects/Project/BedrockProject'
import { RefSchema } from '/@/components/JSONSchema/Schema/Ref'
import { Token } from './Token'
import { markRaw } from '@vue/composition-api'
import { SchemaManager } from '/@/components/JSONSchema/Manager'
import { SmartError } from './Error'
import { SmartWarning } from './Warning'

export class FunctionValidatorTab extends Tab {
	protected fileTab: FileTab | undefined
	protected currentLine = 0
	protected content: string = ''

	protected validCommands: Array<string> = []
	protected validSelectorArgs: Array<string> = []
	protected commandData: any | undefined
	protected generalCommandData: any | undefined
	protected generalSelectorArgsData: any | undefined
	protected blockStateData: any | undefined
	protected stopped = false

	constructor(protected parent: TabSystem, protected tab: FileTab) {
		super(parent)
		this.fileTab = tab
	}

	get name(): string {
		return this.parent.app.locales.translate('functionValidator.tabName')
	}

	isFor(fileHandle: FileSystemFileHandle): Promise<boolean> {
		return Promise.resolve(false)
	}

	component = FunctionValidatorTabComponent

	get icon() {
		return 'mdi-cog-box'
	}

	get iconColor() {
		return 'primary'
	}

	save() {}

	protected translateError(errorName: string) {
		return this.parent.app.locales.translate(
			'functionValidator.errors.' + errorName
		)
	}

	protected translateWarning(errorName: string) {
		return this.parent.app.locales.translate(
			'functionValidator.warnings.' + errorName
		)
	}

	//Load function content
	protected async LoadFileContent() {
		if (this.fileTab) {
			let file = await this.fileTab.getFile()
			this.content = await file?.text()
		}
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

	protected async LoadCommandData() {
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

	protected async GetDocs<String>(command: string = '') {
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
			errors.push(new SmartError('emptyComplexConstructor', start, end))

			return [errors, warnings]
		}

		let confirmedAtributes: string[] = []

		for (let i = 0; i < tokens.length / 4; i++) {
			const offset = i * 4

			if (tokens[offset].type != 'String') {
				errors.push(
					new SmartError(
						'complexConstructorExpectedStringAsAttribute',
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
							'invalidSelectorAttribute.part1',
							'$' + targetAtribute,
							'invalidSelectorAttribute.part2',
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
						'expectedEqualsButNothing',
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
						'expectedEquals',
						tokens[offset + 1].start,
						tokens[offset + 1].end
					)
				)

				return [errors, warnings]
			}

			if (2 + offset >= tokens.length) {
				errors.push(
					new SmartError(
						'expectedValueButNothing',
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
								'attributeNegationSupport.part1',
								'$' + targetAtribute,
								'attributeNegationSupport.part2',
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
								'multipleInstancesNever.part1',
								'$' + targetAtribute,
								'multipleInstancesNever.part2',
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
								'multipleInstancesNegated.part1',
								'$' + targetAtribute,
								'multipleInstances.part2',
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
								'selectorAttributeTypeMismatch.part1',
								'$' + targetType,
								'selectorAttributeTypeMismatch.part2',
								'$' + value.type,
								'selectorAttributeTypeMismatch.part3',
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
									'selectorNotValid.part1',
									'$' + value.type,
									'selectorNotValid.part2',
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
										'schemaFamily.part1',
										'$' + value.value,
										'schemaFamily.part2',
									],
									value.start,
									value.end
								)
							)
						} else if (targetAtribute == 'type') {
							warnings.push(
								new SmartWarning(
									[
										'schemaType.part1',
										'$' + value.value,
										'schemaType.part2',
									],
									value.start,
									value.end
								)
							)
						} else if (targetAtribute == 'tag') {
							warnings.push(
								new SmartWarning(
									[
										'schemaTag.part1',
										'$' + value.value,
										'schemaTag.part2',
									],
									value.start,
									value.end
								)
							)
						} else {
							warnings.push(
								new SmartWarning(
									[
										'schemaValue.part1',
										'$' + value.value,
										'schemaValue.part2',
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
							'expectedComa',
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
			errors.push(this.translateError('jsonNotValid'))
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
			errors.push(new SmartError('emptyScoreData', start, end))
			return [errors, warnings]
		}

		let confirmedValues: string[] = []

		for (let i = 0; i < tokens.length / 4; i++) {
			const offset = i * 4

			let targetValue = tokens[offset].value

			if (tokens[offset].type != 'String') {
				errors.push(
					new SmartError(
						'scoreDataExpectedStringAsValue',
						tokens[offset].start,
						tokens[offset].end
					)
				)

				return [errors, warnings]
			}

			if (1 + offset >= tokens.length) {
				errors.push(
					new SmartError(
						'expectedEqualsButNothing',
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
						'expectedEquals',
						tokens[offset + 1].start,
						tokens[offset + 1].end
					)
				)

				return [errors, warnings]
			}

			if (2 + offset >= tokens.length) {
				errors.push(
					new SmartError(
						'expectedValueButNothing',
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
						'invalidScoreType',
						tokens[offset + 2].start,
						tokens[offset + 2].end
					)
				)

				return [errors, warnings]
			}

			if (confirmedValues.includes(value.value)) {
				errors.push(
					new SmartError(
						'repeatOfSameScore',
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
							'expectedComa',
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
				errors.push(
					this.translateError('blockStateExpectedLongStringAsValue')
				)
				return [errors, warnings]
			}

			if (1 + offset >= tokens.length) {
				//Error expected ':'
				errors.push(this.translateError('expectedColonButNothing'))
				return [errors, warnings]
			}

			if (
				!(tokens[1 + offset].value == ':' && tokens[1].type == 'Symbol')
			) {
				//Error expected ':'
				errors.push(this.translateError('expectedColon'))
				return [errors, warnings]
			}

			if (2 + offset >= tokens.length) {
				//Error expected value
				errors.push(this.translateError('expectedValueButNothing'))
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
						this.translateError('invalidBlockStateValue.part1') +
							value.value +
							this.translateError('invalidBlockStateValue.part2')
					)
					return [errors, warnings]
				}
			}

			if (confirmedValues.includes(value.value)) {
				errors.push(this.translateError('repeatOfBlockState'))
				return [errors, warnings]
			}

			if (3 + offset < tokens.length) {
				if (
					tokens[3 + offset].value == ',' &&
					tokens[3 + offset].type == 'Symbol'
				) {
					//Error expected ','
					errors.push(this.translateError('expectedComa'))
					return [errors, warnings]
				}
			}

			confirmedValues.push(targetValue)
		}

		return [errors, warnings]
	}

	//Gets Errors and Warnings
	protected ValidateCommand<Array>(
		command: string | null,
		commandTokens: Token[] | null = null
	) {
		let errors: SmartError[] = []
		let warnings: any[] = []

		if (!this.blockStateData) {
			warnings.push(new SmartWarning('missingData', 0, 0))
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
						'unclosedString',
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
							'spaceAtStart',
							tokens[lastChange].start,
							tokens[lastChange].end
						)
					)

					return [errors, warnings]
				}

				if (tokens.length == 0) {
					errors.push(new SmartError('emptyCommand'))

					return [errors, warnings]
				}

				baseCommand = tokens[0]

				//Test for basic command
				baseCommand = tokens.shift()!

				if (!this.validCommands.includes(baseCommand.value)) {
					errors.push(
						new SmartError(
							this.translateError('invalidCommand.part1') +
								baseCommand.value +
								this.translateError('invalidCommand.part2'),
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
									'gotColonButNothing',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						}

						if (i - 1 < 0) {
							errors.push(
								new SmartError(
									'missingFirstValueInIdentifierButNothing',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						}

						if (tokens[i - 1].type == 'Space') {
							errors.push(
								new SmartError(
									'missingFirstValueInIdentifierButNothing',
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
									'unexpectedOpenCurlyBracket',
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
									'unexpectedClosedCurlyBracket',
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
									'missingFirstNumberInRangeButNothing',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						}

						if (i + 1 >= tokens.length) {
							errors.push(
								new SmartError(
									'missingDotInRangeButNothing',
									tokens[i - 1].start,
									token.end
								)
							)

							return [errors, warnings]
						}

						if (i + 2 >= tokens.length) {
							errors.push(
								new SmartError(
									'missingSecondNumberInRangeButNothing',
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
									'missingFirstNumberInRange',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						}

						if (!(dot.value == '.' && dot.type == 'Symbol')) {
							errors.push(
								new SmartError(
									'missingDotInRange',
									tokens[i - 1].start,
									token.end
								)
							)

							return [errors, warnings]
						}

						if (secondNum.type != 'Integer') {
							errors.push(
								new SmartError(
									'missingSecondNumberInRange',
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
									'unexpectedOpenCurlyBracket',
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
									'unexpectedClosedCurlyBracket',
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
									'expectedLetterAfterAtButNothing',
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
									'expectedLetterAfterAt',
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
										'invalidSelector.part1',
										'$' + selectorTarget.value,
										'invalidSelector.part2',
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
									'unexpectedOpenSquareBracket',
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
									'unexpectedClosedSquareBracket',
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
									'unexpectedOpenSquareBracket',
									token.start,
									token.end
								)
							)

							return [errors, warnings]
						} else {
							if (i - 1 < 0) {
								errors.push(
									new SmartError(
										'selectorNotBeforeOpenSquareBracketButNothing',
										token.start,
										token.end
									)
								)

								return [errors, warnings]
							}

							if (tokens[i - 1].type != 'Selector') {
								errors.push(
									new SmartError(
										'selectorNotBeforeOpenSquareBracket',
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
									'unexpectedClosedSquareBracket',
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
							'noValidCommandVarsFound.part1',
							'$' + i,
							'noValidCommandVarsFound.part2',
							'$' + arg.type,
							'noValidCommandVarsFound.part3',
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
						'noValidCommandVarsFoundEnd.part1',
						'$' + tokens.length,
						'noValidCommandVarsFoundEnd.part2',
					],
					tokens[tokens.length - 1].start,
					tokens[tokens.length - 1].end
				)
			)

			return [errors, warnings]
		}

		return [errors, warnings]
	}

	protected UpdateLoadedState() {
		let dataLoadingElement = document.getElementById('data-loading')
		let loadedDataElement = document.getElementById('loaded-content')

		if (this.blockStateData) {
			if (dataLoadingElement) {
				dataLoadingElement.classList.add('hidden')
			}

			if (loadedDataElement) {
				loadedDataElement.classList.remove('hidden')
			}
		} else {
			setTimeout(() => {
				this.UpdateLoadedState()
			}, 0)
		}
	}

	//Displays data
	protected async LoadCurrentLine<Boolean>() {
		this.UpdateLoadedState()

		let lines = this.content.split('\n')

		if (this.currentLine < lines.length) {
			let fullCommand = lines[this.currentLine].substring(
				0,
				lines[this.currentLine].length - 1
			)

			if (
				lines[this.currentLine].substring(
					lines[this.currentLine].length - 1
				) != '\r'
			) {
				fullCommand = lines[this.currentLine].substring(
					0,
					lines[this.currentLine].length
				)
			}

			let command = fullCommand.split(' ')[0]

			let lineCounterElement = document.getElementById('line-counter')

			if (lineCounterElement) {
				lineCounterElement.textContent =
					'Line: ' + (this.currentLine + 1).toString()
			}

			let commmandDisplayElement = document.getElementById(
				'command-display'
			)

			if (commmandDisplayElement) {
				if (
					lines[this.currentLine] == '\r' ||
					lines[this.currentLine].length == 0
				) {
					commmandDisplayElement.textContent =
						'Command: Empty Line (No Command)'
				} else {
					commmandDisplayElement.textContent = 'Command: ' + command
				}
			}

			let fullCommmandDisplayElement = document.getElementById(
				'full-command-display'
			)

			if (fullCommmandDisplayElement) {
				fullCommmandDisplayElement.innerHTML =
					'Full Command: ' + lines[this.currentLine]
			}

			let alertsElement = document.getElementById('alerts')
			let docsElement = document.getElementById('docs')

			if (alertsElement && docsElement) {
				let alertCount = alertsElement.children.length

				for (let i = 0; i < alertCount; i++) {
					alertsElement.children[0].remove()
				}

				if (
					lines[this.currentLine] == '\r' ||
					lines[this.currentLine].length == 0
				) {
					docsElement.textContent = 'No documentation.'
				} else {
					let data = await this.ValidateCommand(fullCommand)

					let currentErrorLines = []

					for (let i = 0; i < data[0].length; i++) {
						const start = data[0][i].start
						const end = data[0][i].end

						currentErrorLines.push([start, end])

						let translated = ''

						if (typeof data[0][i].value === 'string') {
							translated = this.translateError(data[0][i].value)
						} else {
							for (let j = 0; j < data[0][i].value.length; j++) {
								if (data[0][i].value[j].startsWith('$')) {
									translated += data[0][i].value[j].substring(
										1
									)
								} else {
									translated += this.translateError(
										data[0][i].value[j]
									)
								}
							}
						}

						var ComponentClass = Vue.extend(Error)
						var instance = new ComponentClass({
							propsData: {
								alertText: translated,
							},
						})

						instance.$mount()
						alertsElement.appendChild(instance.$el)
					}

					let currentWarningLines = []

					for (let i = 0; i < data[1].length; i++) {
						const start = data[1][i].start
						const end = data[1][i].end

						currentWarningLines.push([start, end])

						let translated = ''

						if (typeof data[1][i].value === 'string') {
							translated = this.translateWarning(data[1][i].value)
						} else {
							for (let j = 0; j < data[1][i].value.length; j++) {
								if (data[1][i].value[j].startsWith('$')) {
									translated += data[1][i].value[j].substring(
										1
									)
								} else {
									translated += this.translateWarning(
										data[1][i].value[j]
									)
								}
							}
						}

						var ComponentClass = Vue.extend(Warning)
						var instance = new ComponentClass({
							propsData: {
								alertText: translated,
							},
						})

						instance.$mount()
						alertsElement.appendChild(instance.$el)
					}

					if (fullCommmandDisplayElement) {
						if (fullCommmandDisplayElement.innerHTML) {
							let writeOffset = 0
							let writeIndex = 0

							for (
								let i = 0;
								i < fullCommmandDisplayElement.innerHTML.length;
								i++
							) {
								for (
									let j = 0;
									j < currentErrorLines.length;
									j++
								) {
									if (currentErrorLines[j][0] == writeIndex) {
										fullCommmandDisplayElement.innerHTML =
											'Full Command: ' +
											fullCommmandDisplayElement.innerHTML.substring(
												14,
												14 + i
											) +
											'<span class="error-line">' +
											fullCommmandDisplayElement.innerHTML.substring(
												14 + i,
												fullCommmandDisplayElement
													.innerHTML.length
											)

										i += 25
									}

									if (currentErrorLines[j][1] == writeIndex) {
										fullCommmandDisplayElement.innerHTML =
											'Full Command: ' +
											fullCommmandDisplayElement.innerHTML.substring(
												14,
												14 + i
											) +
											'</span>' +
											fullCommmandDisplayElement.innerHTML.substring(
												14 + i,
												fullCommmandDisplayElement
													.innerHTML.length
											)

										i += 7
									}
								}

								for (
									let j = 0;
									j < currentWarningLines.length;
									j++
								) {
									if (
										currentWarningLines[j][0] == writeIndex
									) {
										fullCommmandDisplayElement.innerHTML =
											'Full Command: ' +
											fullCommmandDisplayElement.innerHTML.substring(
												14,
												14 + i
											) +
											'<span class="warning-line">' +
											fullCommmandDisplayElement.innerHTML.substring(
												14 + i,
												fullCommmandDisplayElement
													.innerHTML.length
											)

										i += 27
									}

									if (
										currentWarningLines[j][1] == writeIndex
									) {
										fullCommmandDisplayElement.innerHTML =
											'Full Command: ' +
											fullCommmandDisplayElement.innerHTML.substring(
												14,
												14 + i
											) +
											'</span>' +
											fullCommmandDisplayElement.innerHTML.substring(
												14 + i,
												fullCommmandDisplayElement
													.innerHTML.length
											)

										i += 7
									}
								}

								writeIndex++
							}
						}
					}

					docsElement.textContent = await this.GetDocs(command)

					if (data[0].length > 0) {
						return true
					}
				}
			}
		} else {
			return true
		}

		return false
	}

	protected SlowStepLine() {
		setTimeout(() => {
			if (!this.stopped) {
				this.currentLine += 1
				this.LoadCurrentLine().then((shouldStop) => {
					if (!shouldStop && !this.stopped) {
						this.SlowStepLine()
					}

					this.stopped = false
				})
			}
		}, 0)
	}

	protected async Play() {
		this.stopped = false

		await this.LoadFileContent()

		this.currentLine = 0

		let shouldStop = false

		shouldStop = await this.LoadCurrentLine()

		if (!shouldStop) {
			this.SlowStepLine()
		}
	}

	protected async StepLine() {
		this.stopped = false

		await this.LoadFileContent()

		this.currentLine += 1
		this.LoadCurrentLine()
	}

	protected async Restart() {
		await this.LoadFileContent()

		this.currentLine = 0
		this.LoadCurrentLine()

		this.stopped = true
	}

	async onActivate() {
		await super.onActivate()

		await this.LoadFileContent()

		await this.LoadCommandData()

		await this.LoadCurrentLine()
	}

	async onDeactivate() {
		this.stopped = true
	}
}
