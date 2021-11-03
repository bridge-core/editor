import { FileTab } from '/@/components/TabSystem/FileTab'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'
import FunctionSimulatorTabComponent from './Tab.vue'
import { Tab } from '../../TabSystem/CommonTab'
import { App } from '/@/App'
import * as monaco from 'monaco-editor'
import { TabSystem } from '../../TabSystem/TabSystem'
import Error from './Error.vue'
import Warning from './Warning.vue'
import Vue from 'vue'
import { ca, el, fa, tr } from 'vuetify/src/locale'
import { BedrockProject } from '../../Projects/Project/BedrockProject'
import { RefSchema } from '/@/components/JSONSchema/Schema/Ref'
import { Token } from './Token'
import { DataLoader } from '../../Data/DataLoader'
import { isReactive, markRaw } from '@vue/composition-api'
import { SchemaManager } from '/@/components/JSONSchema/Manager'

export class FunctionSimulatorTab extends Tab {
	protected fileTab: FileTab | undefined
	protected currentLine = 0
	protected content: string = ''

	protected validCommands: Array<string> = []
	protected validSelectorArgs: Array<string> = []
	protected commandData: any | undefined
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

	component = FunctionSimulatorTabComponent

	get icon() {
		return 'mdi-cog-box'
	}

	get iconColor() {
		return 'primary'
	}

	save() {}

	protected TranslateError(errorName: string) {
		return this.parent.app.locales.translate(
			'functionValidator.errors.' + errorName
		)
	}

	protected TranslateWarning(errorName: string) {
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
		console.log('Still loading command data')
		setTimeout(() => {
			if (!this.blockStateData) {
				let blockStateDataLoaded = markRaw(
					SchemaManager.request(
						'file:///data/packages/minecraftBedrock/schema/general/vanilla/blockState.json'
					)
				)

				if (blockStateDataLoaded.type) {
					this.blockStateData = blockStateDataLoaded
					console.log('Loaded Block State Data!')
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

		//console.log(this.commandData._data.vanilla[0])

		this.validCommands = []
		this.validSelectorArgs = []

		let foundTypes: string[] = []

		if (this.commandData) {
			for (
				let i = 0;
				i < this.commandData._data.vanilla[0].commands.length;
				i++
			) {
				if (
					!this.validCommands.includes(
						this.commandData._data.vanilla[0].commands[i]
							.commandName
					)
				) {
					this.validCommands.push(
						this.commandData._data.vanilla[0].commands[i]
							.commandName
					)
				}
			}

			for (
				let i = 0;
				i < this.commandData._data.vanilla[0].selectorArguments.length;
				i++
			) {
				if (
					!this.validSelectorArgs.includes(
						this.commandData._data.vanilla[0].selectorArguments[i]
							.argumentName
					)
				) {
					this.validSelectorArgs.push(
						this.commandData._data.vanilla[0].selectorArguments[i]
							.argumentName
					)
				}
			}

			//console.log(await this.commandData.getSelectorArgumentsSchema())
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
			console.log('Loaded Block State Data!')
		} else {
			this.LateLoadData()
		}

		console.log(this.blockStateData)
	}

	protected async GetDocs<String>(command: string = '') {
		if (this.commandData) {
			for (
				let i = 0;
				i < this.commandData._data.vanilla[0].commands.length;
				i++
			) {
				if (
					this.commandData._data.vanilla[0].commands[i].commandName ==
					command
				) {
					return this.commandData._data.vanilla[0].commands[i]
						.description
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

	SpecialSymbols = [
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

	WhiteSpace = [' ', '\t', '\n', '\r']

	SelectorTargets = ['a', 's', 'p', 'r', 'e']

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

				if (this.SpecialSymbols.includes(read)) {
					//console.log('Found symbol ' + read)
					foundTokens.push(new Token(read, 'Symbol'))
					found = true
				} else if (this.isInt(read)) {
					//console.log('Found int ' + read)
					foundTokens.push(new Token(read, 'Integer'))
					found = true
					shouldCombine = true
				} else if (this.isFloat(read)) {
					//console.log('Found float ' + read)
					foundTokens.push(new Token(read, 'Float'))
					found = true
				} else if (read == 'true' || read == 'false') {
					foundTokens.push(new Token(read, 'Boolean'))
					found = true
				} else if (read == ' ') {
					//console.log('Found space ' + read)
					foundTokens.push(new Token(read, 'Space'))
					found = true
					//added = false
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
									'String'
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
									'String'
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
								'String'
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
					'String'
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
		}

		return false
	}

	protected ValidateSelector(tokens: Token[]) {
		let errors: string[] = []
		let warnings: string[] = []

		if (tokens.length == 0) {
			//Unexpected empty selector
			errors.push(this.TranslateError('emptyComplexConstructor'))
			return [errors, warnings]
		}

		let confirmedAtributes: string[] = []

		for (let i = 0; i < tokens.length / 4; i++) {
			const offset = i * 4

			if (tokens[0 + offset].type != 'String') {
				errors.push(
					this.TranslateError(
						'complexConstructorExpectedStringAsAttribute'
					)
				)
				return [errors, warnings]
			}

			let targetAtribute = tokens[0 + offset].value
			let found = false
			let argData = null

			//console.log(this.commandData._data.vanilla[0].selectorArguments)

			for (
				let j = 0;
				j < this.commandData._data.vanilla[0].selectorArguments.length;
				j++
			) {
				const selectorArgument = this.commandData._data.vanilla[0]
					.selectorArguments[j]

				//console.log(selectorArgument.argumentName)

				//console.log(targetAtribute)

				if (selectorArgument.argumentName == targetAtribute) {
					argData = selectorArgument
					found = true
					break
				}
			}

			if (!found) {
				//Error unxexpected selector atribute
				errors.push(
					this.TranslateError('invalidSelectorAttribute.part1') +
						targetAtribute +
						this.TranslateError('invalidSelectorAttribute.part2')
				)

				return [errors, warnings]
			}

			if (1 + offset >= tokens.length) {
				//Error expected '='
				errors.push(this.TranslateError('expectedEqualsButNothing'))
				return [errors, warnings]
			}

			if (
				!(tokens[1 + offset].value == '=' && tokens[1].type == 'Symbol')
			) {
				//Error expected '='
				errors.push(this.TranslateError('expectedEquals'))
				return [errors, warnings]
			}

			if (2 + offset >= tokens.length) {
				//Error expected value
				errors.push(this.TranslateError('expectedValueButNothing'))
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

			//console.log(argData)

			if (argData.additionalData) {
				if (!argData.additionalData.supportsNegation && negated) {
					//Error negation not supported
					errors.push(
						this.TranslateError('attributeNegationSupport.part1') +
							targetAtribute +
							this.TranslateError(
								'attributeNegationSupport.part2'
							)
					)
					return [errors, warnings]
				}

				if (
					argData.additionalData.multipleInstancesAllowed ==
						'never' &&
					confirmedAtributes.includes(targetAtribute)
				) {
					//Error multiple instances of this atribute not allowed
					errors.push(
						this.TranslateError('multipleInstancesNever.part1') +
							targetAtribute +
							this.TranslateError('multipleInstancesNever.part2')
					)
					return [errors, warnings]
				}

				if (
					argData.additionalData.multipleInstancesAllowed ==
						'whenNegated' &&
					!negated &&
					confirmedAtributes.includes(targetAtribute)
				) {
					//Error multiple instances of this atribute not allowed when negated
					errors.push(
						this.TranslateError('multipleInstancesNegated.part1') +
							targetAtribute +
							+this.TranslateError('multipleInstances.part2')
					)
					return [errors, warnings]
				}

				let targetType = argData.type

				if (targetAtribute == 'name') {
					targetType = 'selector'
				}

				if (!this.MatchTypes(value.type, targetType)) {
					//Error expected type
					errors.push(
						this.TranslateError(
							'selectorAttributeTypeMismatch.part1'
						) +
							targetType +
							this.TranslateError(
								'selectorAttributeTypeMismatch.part2'
							) +
							value.type +
							this.TranslateError(
								'selectorAttributeTypeMismatch.part3'
							)
					)
					return [errors, warnings]
				}

				if (argData.additionalData.values) {
					if (!argData.additionalData.values.includes(value.value)) {
						//Error unexpected value
						errors.push(
							this.TranslateError('selectorNotValid.part1') +
								value.value +
								this.TranslateError('selectorNotValid.part2')
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

					console.log('Getting Schema Data!')
					console.log(referencePath)
					console.log(schemaReference)

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
								this.TranslateWarning('schemaFamily.part1') +
									value.value +
									this.TranslateWarning('schemaFamily.part2')
							)
						} else if (targetAtribute == 'type') {
							warnings.push(
								this.TranslateWarning('schemaType.part1') +
									value.value +
									this.TranslateWarning('schemaType.part2')
							)
						} else if (targetAtribute == 'tag') {
							warnings.push(
								this.TranslateWarning('schemaTag.part1') +
									value.value +
									this.TranslateWarning('schemaTag.part2')
							)
						} else {
							warnings.push(
								this.TranslateWarning('schemaValue.part1') +
									value.value +
									this.TranslateWarning('schemaValue.part2')
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
					tokens[possibleComaPos + offset].value == ',' &&
					tokens[possibleComaPos + offset].type == 'Symbol'
				) {
					//Error expected ','
					errors.push(this.TranslateError('expectedComa'))
					return [errors, warnings]
				}
			}
		}

		return [errors, warnings]
	}

	protected ValidateJSON(tokens: Token[]) {
		let errors: string[] = []
		let warnings: string[] = []

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
			console.log('Parsing JSON ' + reconstructedJSON)
			JSON.parse(reconstructedJSON)
		} catch (e) {
			errors.push(this.TranslateError('jsonNotValid'))
		}

		return [errors, warnings]
	}

	protected ValidateScoreData(tokens: Token[]) {
		let errors: string[] = []
		let warnings: string[] = []

		if (tokens.length == 0) {
			//Unexpected empty score data
			errors.push(this.TranslateError('emptyScoreData'))
			return [errors, warnings]
		}

		let confirmedValues: string[] = []

		for (let i = 0; i < tokens.length / 4; i++) {
			const offset = i * 4

			let targetValue = tokens[0 + offset].value

			if (tokens[0 + offset].type != 'String') {
				errors.push(
					this.TranslateError('scoreDataExpectedStringAsValue')
				)
				return [errors, warnings]
			}

			if (1 + offset >= tokens.length) {
				//Error expected '='
				errors.push(this.TranslateError('expectedEqualsButNothing'))
				return [errors, warnings]
			}

			if (
				!(tokens[1 + offset].value == '=' && tokens[1].type == 'Symbol')
			) {
				//Error expected '='
				errors.push(this.TranslateError('expectedEquals'))
				return [errors, warnings]
			}

			if (2 + offset >= tokens.length) {
				//Error expected value
				errors.push(this.TranslateError('expectedValueButNothing'))
				return [errors, warnings]
			}

			let value = tokens[2 + offset]

			if (!this.MatchTypes(value.type, 'Score')) {
				errors.push(this.TranslateError('invalidScoreType'))
				return [errors, warnings]
			}

			if (confirmedValues.includes(value.value)) {
				errors.push(this.TranslateError('repeatOfSameScore'))
				return [errors, warnings]
			}

			if (3 + offset < tokens.length) {
				if (
					!(
						tokens[3 + offset].value == ',' &&
						tokens[3 + offset].type == 'Symbol'
					)
				) {
					//Error expected ','
					errors.push(this.TranslateError('expectedComa'))
					return [errors, warnings]
				}
			}

			confirmedValues.push(targetValue)
		}

		return [errors, warnings]
	}

	protected ValidateBlockState(tokens: Token[]) {
		let errors: string[] = []
		let warnings: string[] = []

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
					this.TranslateError('blockStateExpectedLongStringAsValue')
				)
				return [errors, warnings]
			}

			if (1 + offset >= tokens.length) {
				//Error expected ':'
				errors.push(this.TranslateError('expectedColonButNothing'))
				return [errors, warnings]
			}

			if (
				!(tokens[1 + offset].value == ':' && tokens[1].type == 'Symbol')
			) {
				//Error expected ':'
				errors.push(this.TranslateError('expectedColon'))
				return [errors, warnings]
			}

			if (2 + offset >= tokens.length) {
				//Error expected value
				errors.push(this.TranslateError('expectedValueButNothing'))
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

				console.log(targetData)

				let targetValues = targetData.enum

				for (let j = 0; j < targetValues.length; j++) {
					targetValues[j] = targetValues[j].toString()
				}

				if (!targetValues.includes(value.value)) {
					errors.push(
						this.TranslateError('invalidBlockStateValue.part1') +
							value.value +
							this.TranslateError('invalidBlockStateValue.part2')
					)
					return [errors, warnings]
				}
			}

			if (confirmedValues.includes(value.value)) {
				errors.push(this.TranslateError('repeatOfBlockState'))
				return [errors, warnings]
			}

			if (3 + offset < tokens.length) {
				if (
					tokens[3 + offset].value == ',' &&
					tokens[3 + offset].type == 'Symbol'
				) {
					//Error expected ','
					errors.push(this.TranslateError('expectedComa'))
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
		//TODO: Add error and warning class so errors and warnings can have extened info and potential comments on how to fix the errors

		let errors: string[] = []
		let warnings: string[] = []

		if (!this.blockStateData) {
			warnings.push(this.TranslateError('missingData'))
		}

		//Seperate into strings by quotes for parsing

		let splitStrings

		let inString = false

		let tokens: Token[] = []

		let baseCommand: Token

		if (!commandTokens) {
			splitStrings = command!.split('"') //.filter((e) => e)

			for (let i = 0; i < splitStrings.length; i++) {
				if (!inString) {
					tokens.push(new Token(splitStrings[i], 'Dirty'))
				} else {
					tokens.push(new Token(splitStrings[i], 'Long String'))
				}

				inString = !inString
			}

			if (!inString) {
				errors.push(this.TranslateError('unclosedString'))
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
				while (tokens[0].type == 'Space') {
					tokens.splice(0, 1)
				}

				if (tokens.length == 0) {
					errors.push(this.TranslateError('emptyCommand'))

					return [errors, warnings]
				}

				baseCommand = tokens[0]

				//Test for basic command
				baseCommand = tokens.shift()!

				if (!this.validCommands.includes(baseCommand.value)) {
					errors.push(
						this.TranslateError('invalidCommand.part1') +
							tokens[0].value +
							this.TranslateError('invalidCommand.part2')
					)

					return [errors, warnings]
				}

				//Construct Identifiers
				for (let i = 0; i < tokens.length; i++) {
					const token = tokens[i]

					if (token.type == 'Symbol' && token.value == ':') {
						if (i + 1 >= tokens.length) {
							errors.push(
								this.TranslateError('gotColonButNothing')
							)
							return [errors, warnings]
						}

						if (i + -1 < 0) {
							errors.push(
								this.TranslateError(
									'missingFirstValueInIdentifierButNothing'
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
							//Unexpected [
							errors.push(
								this.TranslateError(
									'unexpectedOpenCurlyBracket'
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

							/*errors = errors.concat(result[0])
							warnings = warnings.concat(result[1])

							if (errors.length > 0) {
								return [errors, warnings]
							}*/

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
							//Unexpected ]
							errors.push(
								this.TranslateError(
									'unexpectedClosedCurlyBracket'
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
						if (i + 1 >= tokens.length) {
							errors.push(
								this.TranslateError(
									'missingDotInRangeButNothing'
								)
							)
							return [errors, warnings]
						}

						if (i + 2 >= tokens.length) {
							errors.push(
								this.TranslateError(
									'missingSecondNumberInRangeButNothing'
								)
							)
							return [errors, warnings]
						}

						if (i + -1 < 0) {
							errors.push(
								this.TranslateError(
									'missingFirstNumberInRangeButNothing'
								)
							)
							return [errors, warnings]
						}

						let firstNum = tokens[i - 1]
						let secondNum = tokens[i + 2]
						let dot = tokens[i + 1]

						if (!(dot.value == '.' && dot.type == 'Symbol')) {
							errors.push(
								this.TranslateError('missingDotInRange')
							)
							return [errors, warnings]
						}

						if (firstNum.type != 'Integer') {
							errors.push(
								this.TranslateError('missingFirstNumberInRange')
							)
							return [errors, warnings]
						}

						if (secondNum.type != 'Integer') {
							errors.push(
								this.TranslateError(
									'missingSecondNumberInRange'
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

				//console.log(Array.from(tokens))

				//Construct Score Data
				let inScoreData = false
				let scoreDataToReconstruct: Token[] = []

				for (let i = 0; i < tokens.length; i++) {
					const token = tokens[i]

					if (token.type == 'Symbol' && token.value == '{') {
						if (inScoreData) {
							//Unexpected [
							errors.push(
								this.TranslateError(
									'unexpectedOpenCurlyBracket'
								)
							)
							return [errors, warnings]
						} else {
							inScoreData = true
						}
					} else if (token.type == 'Symbol' && token.value == '}') {
						if (inScoreData) {
							inScoreData = false

							let result = this.ValidateScoreData(
								scoreDataToReconstruct
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
							//Unexpected ]
							errors.push(
								this.TranslateError(
									'unexpectedClosedCurlyBracket'
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
								this.TranslateError(
									'expectedLetterAfterAtButNothing'
								)
							)
							return [errors, warnings]
						}

						let selectorTarget = tokens[i + 1]

						if (selectorTarget.type != 'String') {
							errors.push(
								this.TranslateError('expectedLetterAfterAt')
							)
							return [errors, warnings]
						}

						if (
							!this.SelectorTargets.includes(selectorTarget.value)
						) {
							errors.push(
								this.TranslateError('invalidSelector.part1') +
									selectorTarget +
									this.TranslateError('invalidSelector.part2')
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

				console.log(Array.from(tokens))

				//Construct Block States
				let inBlockState = false
				let blockStateToReconstruct: Token[] = []

				for (let i = 0; i < tokens.length; i++) {
					const token = tokens[i]

					if (token.type == 'Symbol' && token.value == '[') {
						if (inBlockState) {
							//Unexpected [
							errors.push(
								this.TranslateError(
									'unexpectedOpenSquareBracket'
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

							//errors = errors.concat(result[0])
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
							//Unexpected ]
							errors.push(
								this.TranslateError(
									'unexpectedClosedSquareBracket'
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

				console.log(Array.from(tokens))

				//Construct Complex Selectors
				let inSelector = false
				let selectorToReconstruct: Token[] = []

				for (let i = 0; i < tokens.length; i++) {
					const token = tokens[i]

					if (token.type == 'Symbol' && token.value == '[') {
						if (inSelector) {
							//Unexpected [
							errors.push(
								this.TranslateError(
									'unexpectedOpenSquareBracket'
								)
							)
							return [errors, warnings]
						} else {
							if (i - 1 < 0) {
								errors.push(
									this.TranslateError(
										'selectorNotBeforeOpenSquareBracketButNothing'
									)
								)
								return [errors, warnings]
							}

							if (tokens[i - 1].type != 'Selector') {
								errors.push(
									this.TranslateError(
										'selectorNotBeforeOpenSquareBracket'
									)
								)
								return [errors, warnings]
							}

							inSelector = true
						}
					} else if (token.type == 'Symbol' && token.value == ']') {
						if (inSelector) {
							inSelector = false

							let result = this.ValidateSelector(
								selectorToReconstruct
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
							//Unexpected ]
							errors.push(
								this.TranslateError(
									'unexpectedClosedSquareBracket'
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

		console.log(Array.from(tokens))

		//Validate Command Argument Types
		let possibleCommandVariations = []

		for (
			let i = 0;
			i < this.commandData._data.vanilla[0].commands.length;
			i++
		) {
			if (
				this.commandData._data.vanilla[0].commands[i].commandName ==
				baseCommand!.value
			) {
				possibleCommandVariations.push(
					this.commandData._data.vanilla[0].commands[i].arguments
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
					this.TranslateError('noValidCommandVarsFound.part1') +
						i +
						this.TranslateError('noValidCommandVarsFound.part2') +
						arg.type +
						this.TranslateError('noValidCommandVarsFound.part3')
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
				this.TranslateError('noValidCommandVarsFoundEnd.part1') +
					tokens.length +
					this.TranslateError('noValidCommandVarsFoundEnd.part2')
			)
			return [errors, warnings]
		}

		return [errors, warnings]
	}

	//Displays data
	protected async LoadCurrentLine<Boolean>() {
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

			//.filter(i => i !== "\r")

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
				fullCommmandDisplayElement.textContent =
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

					for (let i = 0; i < data[0].length; i++) {
						var ComponentClass = Vue.extend(Error)
						var instance = new ComponentClass({
							propsData: { alertText: data[0][i] },
						})

						instance.$mount() // pass nothing
						alertsElement.appendChild(instance.$el)
					}

					for (let i = 0; i < data[1].length; i++) {
						var ComponentClass = Vue.extend(Warning)
						var instance = new ComponentClass({
							propsData: { alertText: data[1][i] },
						})

						instance.$mount() // pass nothing
						alertsElement.appendChild(instance.$el)
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

		/*while (!shouldStop) {
			this.currentLine += 1
			shouldStop = await this.loadCurrentLine()
		}*/
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
