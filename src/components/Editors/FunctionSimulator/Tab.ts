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
import { ca, el, fa } from 'vuetify/src/locale'

export class FunctionSimulatorTab extends Tab {
	protected fileTab: FileTab | undefined
	protected currentLine = 0
	protected content: string = ''

	protected validCommands: Array<string> = []
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

	protected async readCommandsJson<Object>() {
		let file = await fetch(process.env.BASE_URL + 'commands.json')
		return file.json()
	}

	protected async loadCommandData() {
		this.commandData = await this.readCommandsJson()

		this.validCommands = []

		if (this.commandData) {
			for (let i = 0; i < this.commandData.commands.length; i++) {
				this.validCommands.push(this.commandData.commands[i].name)
			}
		} else {
			console.error('Unable to load commands.json')
		}

		console.log(this.commandData)
	}

	protected async getDocs<String>(command: string = '') {
		/*if (this.commandData) {
			this.commandData.loadCommandData(command).then(function (data) {
				console.log(data)
			})
		}*/

		return 'Unable to get docs for this command!'
	}

	protected getArgType<String>(arg: string) {
		//Positional
		if (arg.substring(0, 1) == '~' || arg.substring(0, 1) == '^') {
			if (!isNaN(parseFloat(arg.substring(1, arg.length)))) {
				return 'number'
			} else {
				return 'Error: Expected number after positional argument!'
			}
		}

		//Selector
		if (arg.substring(0, 1) == '@') {
			if (this.commandData.selectors.includes(arg)) {
				return 'selector'
			} else {
				return 'Error: Expected letter after selector argument!'
			}
		}

		//Number
		if (!isNaN(parseFloat(arg))) {
			console.log('Number: ' + arg)

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
				argTypes.push(this.getArgType(args[i]))
			}

			let commandValidation = undefined

			for (let i = 0; i < this.commandData.commands.length; i++) {
				if (this.commandData.commands[i].name == baseCommand) {
					commandValidation = this.commandData.commands[i].variations
				}
			}

			let found = false

			console.log(argTypes)

			for (let i = 0; i < commandValidation.length; i++) {
				console.log(commandValidation[i].arguments)

				if (
					this.doesStringArrayMatchArray(
						commandValidation[i].arguments,
						argTypes
					)
				) {
					found = true
					break
				}

				if (commandValidation[i].arguments.includes('any')) {
					found = true
					break
				}
			}

			if (!found) {
				errors.push('Invalid arguments for command: ' + command)
			}
		}

		console.log('~~~~~~~~~')

		return [errors, warnings]
	}

	protected async loadCurrentLine<Boolean>() {
		let lines = this.content.split('\n')

		if (this.currentLine < lines.length) {
			let fullCommand = lines[this.currentLine].substring(
				0,
				lines[this.currentLine].length - 1
			)

			console.log(fullCommand)

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
				if (lines[this.currentLine] == '\r') {
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

				if (lines[this.currentLine] != '\r') {
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
		this.currentLine = 0

		let shouldStop = false

		shouldStop = await this.loadCurrentLine()

		console.log(shouldStop)

		while (!shouldStop) {
			this.currentLine += 1
			shouldStop = await this.loadCurrentLine()

			console.log(shouldStop)
		}
	}

	async onActivate() {
		await super.onActivate()
		const app = await App.getApp()

		await this.loadCommandData()

		if (this.fileTab) {
			let file = await this.fileTab.getFile()
			this.content = await file?.text()
			this.loadCurrentLine()

			//Colorize
			/*let textDisplayElement: HTMLElement | null = null

			textDisplayElement = document.getElementById(
				'function-simulator-line-inspector-text'
			)

			if (textDisplayElement && this.content) {
				let colorize = await monaco.editor.colorize(
					this.content,
					'mcfunction',
					{
						tabSize: 5,
					}
				)

				textDisplayElement.innerHTML = colorize
			}

			let rawCommand = document.getElementById('raw-command')

			if (rawCommand) {
				let line = this.content.split('\n')[this.currentLine - 1]

				console.log(line)

				let colorize = await monaco.editor.colorize(
					line,
					'mcfunction',
					{
						tabSize: 5,
					}
				)

				rawCommand.innerHTML = colorize

				console.log(colorize)
			}*/
		}
	}
}
