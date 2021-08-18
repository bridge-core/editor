import { FileTab } from '/@/components/TabSystem/FileTab'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'
import FunctionSimulatorTabComponent from './Tab.vue'
import { Tab } from '../../TabSystem/CommonTab'
import { App } from '/@/App'
import * as monaco from 'monaco-editor'
import { TabSystem } from '../../TabSystem/TabSystem'

export class FunctionSimulatorTab extends Tab {
	protected fileTab: FileTab | undefined
	protected currentLine = 0
	protected content: string = ''

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
		return 'mdi-file-image-outline'
	}
	get iconColor() {
		return 'primary'
	}

	save() {}

	protected loadCurrentLine() {
		let lines = this.content.split('\n')

		if (this.currentLine < lines.length) {
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
					commmandDisplayElement.textContent =
						'Command: ' + lines[this.currentLine].split(' ')[0]
				}
			}

			let fullCommmandDisplayElement = document.getElementById(
				'full-command-display'
			)

			if (fullCommmandDisplayElement) {
				fullCommmandDisplayElement.textContent =
					'Full Command: ' + lines[this.currentLine]
			}
		}
	}

	async onActivate() {
		await super.onActivate()
		const app = await App.getApp()

		if (this.fileTab) {
			let file = await this.fileTab.getFile()

			this.content = await file?.text()

			//Colorize
			let textDisplayElement: HTMLElement | null = null

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
			} else {
				console.log('Text Element Null')
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
			}

			this.loadCurrentLine()
		}
	}
}
