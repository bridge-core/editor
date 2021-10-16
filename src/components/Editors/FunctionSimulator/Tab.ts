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

export class FunctionSimulatorTab extends Tab {
	protected fileTab: FileTab | undefined
	protected currentLine = 0
	protected content: string = ''

	protected validCommands: Array<string> = []
	protected validSelectorArgs: Array<string> = []
	protected commandData: any | undefined
	protected stopped = false

	constructor(protected parent: TabSystem, protected tab: FileTab) {
		super(parent)
		this.fileTab = tab
	}

	get name(): string {
		return this.parent.app.locales.translate('simulator.function')
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

	//Load function content
	protected async loadFileContent() {
		if (this.fileTab) {
			let file = await this.fileTab.getFile()
			this.content = await file?.text()
		}
	}

	//Reads Command Data
	protected async readCommandsJson<Object>() {
		let file = await fetch(process.env.BASE_URL + 'commands.json')
		return file.json()
	}

	protected async loadCommandData() {
		const app = await App.getApp()
		const project = await app.project

		if (project instanceof BedrockProject) {
			this.commandData = project.commandData
		}

		this.validCommands = []
		this.validSelectorArgs = []

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
		} else {
			console.error('Unable to load commands.json')
		}
	}

	protected async getDocs<String>(command: string = '') {
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

	protected getArgType<String>(arg: string) {
		//Long String
		if (arg.substring(0, 1) == '"') {
			return 'long string'
		}

		//Positional
		if (arg.substring(0, 1) == '~' || arg.substring(0, 1) == '^') {
			if (arg.length == 1) {
				return 'position'
			} else if (!isNaN(parseFloat(arg.substring(1, arg.length)))) {
				return 'position'
			} else {
				return 'Error: Expected number after positional argument!'
			}
		}

		//Selector
		if (arg.substring(0, 1) == '@') {
			if (arg.length == 1) {
				return 'Error: Expected letter after selector argument!'
			}

			if (
				['@a', '@p', '@e', '@e', '@r', '@s'].includes(
					arg.substring(0, 2)
				)
			) {
				return 'selector'
			} else {
				return "Error: Unknown selector '" + arg.substring(0, 2) + "'!"
			}
		}

		//Number
		if (!isNaN(parseFloat(arg))) {
			return 'number'
		}

		return 'string'
	}

	protected doesStringArrayMatchArray<Bollean>(
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
		return /^-?[\d]+(?:e-?\d+)?$/.test(n)
	}

	protected isFloat(n: string) {
		return /^-?[\d.]+(?:e-?\d+)?$/.test(n)
	}

	SpecialSymbols = ['[', ']', '!', '=', '@', '~', '^', '!', ',']

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
				} else if (read == ' ') {
					//console.log('Found space ' + read)
					//foundTokens.push(new Token(read, 'Space'))
					found = true
					added = false
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
						console.log(
							'Unexpected Special ' +
								dirtyString.value.substring(
									lastUnexpected,
									readEnd
								)
						)
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
		}

		return false
	}

	protected ValidateSelector(tokens: Token[]) {
		let errors: string[] = []
		let warnings: string[] = []

		if (tokens.length == 0) {
			//Unexpected empty selector
			errors.push('1')
			return [errors, warnings]
		}

		let confirmedAtributes: string[] = []

		for (let i = 0; i < tokens.length / 4; i++) {
			const offset = i * 4

			let targetAtribute = tokens[0 + offset].value
			let found = false
			let argData = null

			for (
				let j = 0;
				j < this.commandData._data.vanilla[0].selectorArguments.length;
				j++
			) {
				const selectorArgument = this.commandData._data.vanilla[0]
					.selectorArguments[j]

				if (selectorArgument.argumentName == targetAtribute) {
					argData = selectorArgument
					found = true
					break
				}
			}

			if (!found) {
				//Error unxexpected selector atribute
				errors.push('2')
			}

			if (1 + offset >= tokens.length) {
				//Error expected '='
				errors.push('3')
				return [errors, warnings]
			}

			if (tokens[1 + offset].value != '=' && tokens[1].type != 'Symbol') {
				//Error expected '='
				errors.push('4')
				return [errors, warnings]
			}

			if (2 + offset >= tokens.length) {
				//Error expected value
				errors.push('5')
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
					//Error negation not supported
					errors.push('6')
					return [errors, warnings]
				}

				if (
					argData.additionalData.multipleInstancesAllowed ==
						'never' &&
					confirmedAtributes.includes(targetAtribute)
				) {
					//Error multiple instances of this atribute not allowed
					errors.push('7')
					return [errors, warnings]
				}

				if (
					argData.additionalData.multipleInstancesAllowed ==
						'whenNegated' &&
					!negated &&
					confirmedAtributes.includes(targetAtribute)
				) {
					//Error multiple instances of this atribute not allowed when negated
					errors.push('8')
					return [errors, warnings]
				}

				let targetType = argData.type

				if (targetAtribute == 'name') {
					targetType = 'selector'
				}

				if (!this.MatchTypes(value.type, targetType)) {
					//Error expected type
					errors.push(
						"Expected value type of '" +
							targetType +
							"', but got '" +
							value.type +
							"'!"
					)
					return [errors, warnings]
				}

				if (argData.additionalData.values) {
					if (!argData.additionalData.values.includes(value.value)) {
						//Error unexpected value
						errors.push('10')
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
						warnings.push('11')
					}
				}
			}

			if (4 + offset < tokens.length) {
				if (
					tokens[4 + offset].value != ',' &&
					tokens[4 + offset].type != 'Symbol'
				) {
					//Error expected ','
					errors.push('11')
					return [errors, warnings]
				}
			}
		}

		return [errors, warnings]
	}

	//Gets Errors and Warnings
	protected async readCommand<Array>(command: string) {
		let errors: string[] = []
		let warnings: string[] = []

		//Seperate into strings by quotes for parsing

		let splitStrings = command.split('"').filter((e) => e)

		let inString = false

		let tokens: Token[] = []

		for (let i = 0; i < splitStrings.length; i++) {
			if (!inString) {
				tokens.push(new Token(splitStrings[i], 'Dirty'))
			} else {
				tokens.push(new Token(splitStrings[i], 'Long String'))
			}

			inString = !inString
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
			//Test for basic command
			let baseCommand = tokens.shift()!

			if (!this.validCommands.includes(baseCommand.value)) {
				errors.push("'" + tokens[0].value + '" is not a valid command!')

				return [errors, warnings]
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

			//Construct Basic Selectors
			for (let i = 0; i < tokens.length; i++) {
				const token = tokens[i]

				if (token.type == 'Symbol' && token.value == '@') {
					if (i + 1 >= tokens.length) {
						errors.push('Expected leter after @!')
						return [errors, warnings]
					}

					let selectorTarget = tokens[i + 1]

					if (selectorTarget.type != 'String') {
						errors.push('Expected letter after @!')
						return [errors, warnings]
					}

					if (!this.SelectorTargets.includes(selectorTarget.value)) {
						errors.push(
							'@' + selectorTarget + ' is not a valid selector!'
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

			//Construct Complex Selectors
			let inSelector = false
			let selectorToReconstruct: Token[] = []

			for (let i = 0; i < tokens.length; i++) {
				const token = tokens[i]

				if (token.type == 'Symbol' && token.value == '[') {
					if (inSelector) {
						//Unexpected [
						errors.push('12')
						return [errors, warnings]
					} else {
						if (i - 1 < 0) {
							errors.push('Expected selector before [!')
							return [errors, warnings]
						}

						if (tokens[i - 1].type != 'Selector') {
							errors.push('Expected selector before [!')
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

						let startingPoint = selectorToReconstruct.length - 3

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
						errors.push('13')
						return [errors, warnings]
					}
				} else {
					if (inSelector) {
						selectorToReconstruct.push(token)
					}
				}
			}

			//Validate Command Argument Types
			let possibleCommandVariations = []

			for (
				let i = 0;
				i < this.commandData._data.vanilla[0].commands.length;
				i++
			) {
				if (
					this.commandData._data.vanilla[0].commands[i].commandName ==
					baseCommand.value
				) {
					possibleCommandVariations.push(
						this.commandData._data.vanilla[0].commands[i].arguments
					)
				}
			}

			console.log(Array.from(possibleCommandVariations))
			console.log(Array.from(tokens))

			let lastValidVariations: Token[] = Array.from(
				possibleCommandVariations
			)

			for (let i = 0; i < tokens.length; i++) {
				const arg = tokens[i]

				for (let j = 0; j < possibleCommandVariations.length; j++) {
					const variation = possibleCommandVariations[j]

					if (variation.length <= i) {
						possibleCommandVariations.splice(j, 1)
						j--
						continue
					}

					if (!this.MatchTypes(arg.type, variation[i].type)) {
						console.log(
							arg.type + ' did not match ' + variation[i].type
						)
						possibleCommandVariations.splice(j, 1)
						j--
					}
				}

				if (possibleCommandVariations.length == 0) {
					errors.push('No valid command variations found!')
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

			console.log(Array.from(possibleCommandVariations))

			if (possibleCommandVariations.length == 0) {
				errors.push('No valid command variations found!')
				return [errors, warnings]
			}
		}

		return [errors, warnings]
	}

	//Displays data
	protected async loadCurrentLine<Boolean>() {
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
					let data = await this.readCommand(fullCommand)

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

					docsElement.textContent = await this.getDocs(command)

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

	protected slowStepLine() {
		setTimeout(() => {
			this.currentLine += 1
			this.loadCurrentLine().then((shouldStop) => {
				if (!shouldStop && !this.stopped) {
					this.slowStepLine()
				}

				this.stopped = false
			})
		}, 1)
	}

	protected async play() {
		this.stopped = false

		await this.loadFileContent()

		this.currentLine = 0

		let shouldStop = false

		shouldStop = await this.loadCurrentLine()

		if (!shouldStop) {
			this.slowStepLine()
		}

		/*while (!shouldStop) {
			this.currentLine += 1
			shouldStop = await this.loadCurrentLine()
		}*/
	}

	protected async stepLine() {
		this.stopped = false

		await this.loadFileContent()

		this.currentLine += 1
		this.loadCurrentLine()
	}

	protected async restart() {
		await this.loadFileContent()

		this.currentLine = 0
		this.loadCurrentLine()

		this.stopped = true
	}

	async onActivate() {
		await super.onActivate()

		await this.loadFileContent()

		await this.loadCommandData()

		await this.loadCurrentLine()
	}

	async onDeactivate() {
		this.stopped = true
	}
}
