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

export class FunctionSimulatorTab extends Tab {
	protected fileTab: FileTab | undefined
	protected currentLine = 0
	protected content: string = ''

	protected validCommands: Array<string> = []
	protected validSelectorArgs: Array<string> = []
	protected commandData: any | undefined

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
			if (['@a', '@p', '@e', '@e', '@r'].includes(arg.substring(0, 2))) {
				return 'selector'
			} else {
				return 'Error: Expected letter after selector argument!'
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

	//Gets Errors and Warnings
	protected async readCommand<Array>(command: string = '') {
		let errors: string[] = []
		let warnings: string[] = []

		let baseCommand = command.split(' ')[0]

		if (!this.validCommands.includes(baseCommand)) {
			errors.push('Unknown command: ' + baseCommand)
		} else {
			let args = command.split(' ')
			args.splice(0, 1)

			let argTypes = []

			for (let i = 0; i < args.length; i++) {
				let argType = this.getArgType(args[i])

				if (argType.substring(0, 6) == 'Error:') {
					errors.push(argType.substring(7, argType.length))
					break
				}

				if (argType == 'selector') {
					//Get selector by looking for [ ] only if selector is over 2 characters and next character is not [
					let shouldValidateSelector = false

					shouldValidateSelector = args[i].length > 2

					if (!shouldValidateSelector && i < args.length - 1) {
						shouldValidateSelector =
							args[i + 1].substring(0, 1) == '['
					}

					if (shouldValidateSelector) {
						let foundOpenSquareBrackets = false
						let foundOpenIndex = 0

						for (let j = 0; j < args[i].length; j++) {
							if (args[i].substring(j, j + 1) == '[') {
								if (!foundOpenSquareBrackets) {
									foundOpenSquareBrackets = true
									foundOpenIndex = j
								} else {
									errors.push(
										"Unexpected '[' inside of a selector!"
									)
									break
								}
							}
						}

						let foundCloseSquareBrackets = false

						if (!foundOpenSquareBrackets) {
							for (let j = 0; j < args[i].length; j++) {
								if (args[i].substring(j, j + 1) == ']') {
									foundCloseSquareBrackets = true
									errors.push("Unexpected ']' before '['!")
									break
								}
							}
						}

						if (!foundCloseSquareBrackets) {
							//Have not found ] before [ and if !foundOpenSquareBrackets then [ is in next arg and this arg should be 2 in length
							if (
								args[i].length > 2 &&
								!foundOpenSquareBrackets
							) {
								errors.push("Expected '[' after selector!")
							} else {
								//Look for ] then add all args between [ and ] to get selector to validate
								let addedSelector = ''
								let amountAdded = 0

								if (args[i].length > 2) {
									addedSelector += args[i].substring(
										foundOpenIndex + 1,
										args[i].length
									)

									if (
										args[i].substring(
											args[i].length - 1,
											args[i].length
										) == ']'
									) {
										foundCloseSquareBrackets = true
									}
								}

								if (!foundCloseSquareBrackets) {
									console.log('Isolating Selector')

									console.log(args)

									for (let j = i + 1; j < args.length; j++) {
										if (
											j == i + 1 &&
											args[j].substring(0, 1) == '['
										) {
											addedSelector += args[j].substring(
												1,
												args[j].length
											)
										} else {
											addedSelector += args[j]
										}

										console.log('Added:')
										console.log(addedSelector)
										console.log(
											args[j].substring(
												args[j].length - 1,
												args[j].length
											)
										)

										if (
											args[j].substring(
												args[j].length - 1,
												args[j].length
											) == ']'
										) {
											amountAdded = j - i
											foundCloseSquareBrackets = true
											break
										}
									}
								}

								console.log('Isolated Selector')
								console.log(addedSelector)

								if (
									addedSelector.substring(
										addedSelector.length - 1,
										addedSelector.length
									) == ']'
								) {
									addedSelector = addedSelector.substring(
										0,
										addedSelector.length - 1
									)
								}

								if (!foundCloseSquareBrackets) {
									errors.push("Expected ']' after selector!")
								} else {
									if (
										addedSelector.substring(
											addedSelector.length - 1,
											addedSelector.length
										) == ']'
									) {
										errors.push(
											"Unexpected ']' after selector!"
										)
									} else {
										//Should now validate addedSelector because it is now found between [ and ]
										console.log('Isolated Selector:')
										console.log(addedSelector)

										//TODO: Isolate strings in quotes

										let selectorArgs = addedSelector.split(
											','
										)

										console.log(selectorArgs)

										let targetsCompleted: string[] = []

										for (
											let j = 0;
											j < selectorArgs.length;
											j++
										) {
											let arg = selectorArgs[j].split('=')

											let target = arg[0]
											let value = arg[1]

											let negated =
												value.substring(0, 1) == '!'

											if (negated) {
												value = value.substring(
													1,
													value.length
												)
											}

											console.log(target + ' : ' + value)

											if (
												!this.validSelectorArgs.includes(
													target
												)
											) {
												errors.push(
													"Invalid selector argument: '" +
														target +
														"'!"
												)
											} else {
												//Validate type and negation

												let targetType = null
												let argData = null

												for (
													let i = 0;
													i <
													this.commandData._data
														.vanilla[0]
														.selectorArguments
														.length;
													i++
												) {
													if (
														this.commandData._data
															.vanilla[0]
															.selectorArguments[
															i
														].argumentName == target
													) {
														argData = this
															.commandData._data
															.vanilla[0]
															.selectorArguments[
															i
														]

														break
													}
												}

												targetType = argData.type

												if (targetType == 'tag') {
													targetType = 'string'
												}

												let actualType = this.getArgType(
													value
												)

												if (targetType != actualType) {
													errors.push(
														"Invalid type for '" +
															target +
															"'! Expected '" +
															targetType +
															"' but got '" +
															actualType +
															"'!"
													)
												} else {
													if (
														argData.additionalData
															.supportsNegation ==
															null &&
														negated
													) {
														errors.push(
															"Negation not supported for '" +
																target +
																"'!"
														)
													} else {
														if (
															argData
																.additionalData
																.multipleInstancesAllowed ==
																'never' &&
															targetsCompleted.includes(
																target
															)
														) {
															errors.push(
																"Multiple instances of '" +
																	target +
																	"' not allowed!"
															)
														} else if (
															argData
																.additionalData
																.multipleInstancesAllowed ==
																'whenNegated' &&
															targetsCompleted.includes(
																target
															) &&
															negated
														) {
															errors.push(
																"Multiple instances of '" +
																	target +
																	"' not allowed when negated!"
															)
														} else {
															let strongValued =
																argData
																	.additionalData
																	.values !=
																	null &&
																!argData.additionalData.values.includes(
																	value
																)

															if (strongValued) {
																errors.push(
																	"Unsupported value of '" +
																		target +
																		"'!"
																)
															} else {
																targetsCompleted.push(
																	target
																)
															}
														}
													}
												}
											}
										}

										i += amountAdded
									}
								}
							}
						}
					}
				}

				//TODO: Isolate strings in quotes

				console.log('Arg type of ' + args[i] + ' is ' + argType)

				argTypes.push(argType)
			}

			let commandVariations = []

			for (
				let i = 0;
				i < this.commandData._data.vanilla[0].commands.length;
				i++
			) {
				if (
					this.commandData._data.vanilla[0].commands[i].commandName ==
					baseCommand
				) {
					commandVariations.push(
						this.commandData._data.vanilla[0].commands[i].arguments
					)
				}
			}

			let fail = true

			//Repeat for every variation of the command
			for (let i = 0; i < commandVariations.length; i++) {
				console.log('Checking variation...')
				console.log(commandVariations[i])

				//if already fail end other wise continue
				if (fail) {
					fail = false
				} else {
					break
				}

				//Check if current argument variation is valid other fail and move to next variation
				let argumentIndex = 0

				let currentVariation = commandVariations[i]

				for (let j = 0; j < currentVariation.length; j++) {
					//End check if no more arg types
					if (argTypes.length <= argumentIndex) {
						break
					}

					if (currentVariation[j].type != null) {
						console.log(
							currentVariation[j].type +
								' : ' +
								argTypes[argumentIndex]
						)
						if (
							currentVariation[j].type == argTypes[argumentIndex]
						) {
							//Argument matched
						} else if (
							currentVariation[j].type == 'coordinate' &&
							(argTypes[argumentIndex] == 'number' ||
								argTypes[argumentIndex] == 'position')
						) {
							//was cordinate so matched
						} else {
							fail = true
							break
						}

						argumentIndex++
					}
				}

				//Check if still have arguments to check
				if (argumentIndex <= currentVariation.length) {
					let allOptional = true

					//check if all left params are optional
					for (
						let j = argumentIndex;
						j < currentVariation.length;
						j++
					) {
						if (currentVariation[j].type != null) {
							if (currentVariation[j].isOptional == null) {
								//found not optional param still left
								fail = true
								break
							} else {
								console.log(
									'Param is optional: ' +
										currentVariation[j].type
								)
							}
						}
					}
				}
			}

			if (fail) {
				errors.push('Invalid arguments for command: ' + command)
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

	protected async play() {
		await this.loadFileContent()

		this.currentLine = 0

		let shouldStop = false

		shouldStop = await this.loadCurrentLine()

		while (!shouldStop) {
			this.currentLine += 1
			shouldStop = await this.loadCurrentLine()
		}
	}

	protected async stepLine() {
		await this.loadFileContent()

		this.currentLine += 1
		this.loadCurrentLine()
	}

	protected async restart() {
		await this.loadFileContent()

		this.currentLine = 0
		this.loadCurrentLine()
	}

	async onActivate() {
		await super.onActivate()

		await this.loadFileContent()

		await this.loadCommandData()

		await this.loadCurrentLine()
	}
}
