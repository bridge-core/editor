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
import { el, fa } from 'vuetify/src/locale'
import { BedrockProject } from '../../Projects/Project/BedrockProject'
import { CommandData } from '../../Languages/Mcfunction/Data'

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

	protected async readCommand<Array>(command: string = '') {
		let errors: string[] = []
		let warnings: string[] = []

		console.log(this.validCommands)

		if (!this.validCommands.includes(command)) {
			errors.push('Unknown command: ' + command)
		}

		return [errors, warnings]
	}

	protected async loadCurrentLine<Boolean>() {
		let lines = this.content.split('\n')

		if (this.currentLine < lines.length) {
			let command = lines[this.currentLine].split(' ')[0]

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
					let data = await this.readCommand(command)

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
		let shouldStop = false

		shouldStop = await this.loadCurrentLine()

		console.log(shouldStop)

		while (!shouldStop) {
			this.currentLine += 1
			shouldStop = await this.loadCurrentLine()

			console.log(shouldStop)
		}

		this.currentLine = 0
	}

	async onActivate() {
		await super.onActivate()
		const app = await App.getApp()

		/*const project = await app.project
		if (project instanceof BedrockProject) {
			this.commandData = project.commandData
		}*/

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
