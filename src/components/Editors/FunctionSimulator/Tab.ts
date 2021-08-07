import { FileTab } from '/@/components/TabSystem/FileTab'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'
import FunctionSimulatorTabComponent from './Tab.vue'
import { Tab } from '../../TabSystem/CommonTab'
import { App } from '/@/App'
import * as monaco from 'monaco-editor'
import { TabSystem } from '../../TabSystem/TabSystem'

export class FunctionSimulatorTab extends Tab {
	protected fileTab: FileTab | undefined
	protected currentLine = 4

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

	async onActivate() {
		function RecolorColor(
			className: string,
			color:
				| 'primary'
				| 'warning'
				| 'error'
				| 'lineHighlightBackground'
				| 'info'
				| 'success' = 'info',
			extra: string = ''
		) {
			let elements = document.getElementsByClassName(
				className
			) as HTMLCollectionOf<HTMLElement>

			console.log(className)
			console.log(elements)

			for (let i = 0; i < elements.length; i++) {
				elements[i].style.color =
					extra + app.themeManager.getColor(color)

				console.log(elements[i].style.color)
			}
		}

		function RecolorBack(
			className: string,
			color:
				| 'primary'
				| 'warning'
				| 'error'
				| 'lineHighlightBackground'
				| 'info'
				| 'success'
				| 'secondary'
				| 'accent'
				| 'toolbar'
				| 'expandedSidebar' = 'info',
			extra: string = ''
		) {
			const elements = document.getElementsByClassName(
				className
			) as HTMLCollectionOf<HTMLElement>

			for (let i = 0; i < elements.length; i++) {
				elements[i].style.background =
					extra + app.themeManager.getColor(color)
			}
		}

		function RecolorBorder(
			className: string,
			color:
				| 'primary'
				| 'warning'
				| 'error'
				| 'lineHighlightBackground'
				| 'info'
				| 'success'
				| 'secondary'
				| 'accent'
				| 'toolbar' = 'info',
			extra: string = ''
		) {
			const elements = document.getElementsByClassName(
				className
			) as HTMLCollectionOf<HTMLElement>

			for (let i = 0; i < elements.length; i++) {
				elements[i].style.border =
					extra + app.themeManager.getColor(color)
			}
		}

		await super.onActivate()
		const app = await App.getApp()

		RecolorBorder('border', 'lineHighlightBackground', 'thin solid ')

		RecolorBack('warning-info', 'warning')
		RecolorBack('error-info', 'error')

		RecolorColor('ok-icon', 'success')
		RecolorColor('warning-icon', 'warning')
		RecolorColor('info-icon', 'info')
		RecolorColor('error-icon', 'error')

		RecolorBack('icon-back', 'expandedSidebar')

		if (this.fileTab) {
			let file = await this.fileTab.getFile()

			let contents = await file?.text()

			let textDisplayElement: HTMLElement | null = null

			textDisplayElement = document.getElementById(
				'function-simulator-line-inspector-text'
			)

			if (textDisplayElement && contents) {
				let colorize = await monaco.editor.colorize(
					contents,
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
				let line = contents.split('\n')[this.currentLine - 1]

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

			console.log(contents)
		}
	}
}
