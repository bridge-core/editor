import { FileTab } from '/@/components/TabSystem/FileTab'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'
import FunctionSimulatorTabComponent from './Tab.vue'
import { Tab } from '../../TabSystem/CommonTab'
import { App } from '/@/App'
import * as monaco from 'monaco-editor'

export class FunctionSimulatorTab extends Tab {
	protected fileHandle: FileSystemFileHandle | undefined

	get name(): string {
		return this.parent.app.locales.translate('simulator.function')
	}

	isFor(fileHandle: FileSystemFileHandle): Promise<boolean> {
		this.fileHandle = fileHandle
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
		await super.onActivate()
		const app = await App.getApp()

		const borderDivs = document.getElementsByClassName(
			'border'
		) as HTMLCollectionOf<HTMLElement>

		for (let i = 0; i < borderDivs.length; i++) {
			borderDivs[i].style.border =
				'thin solid ' +
				app.themeManager.getColor('lineHighlightBackground')
		}

		if (this.fileHandle) {
			let file = await this.fileHandle.getFile()

			console.log(file)

			let contents = await file?.text()

			let textDisplayElement: HTMLElement | null = null

			textDisplayElement = document.getElementById(
				'function-simulator-line-inspector-text'
			)

			console.log('Before Color')

			if (textDisplayElement && contents) {
				//textDisplayElement.textContent = contents || 'Function Is Empty!'

				//monaco.editor.colorizeElement(
				//	textDisplayElement,
				//	new monaco.editor.IColorizerElementOptions()
				//)
				let colorize = await monaco.editor.colorize(
					contents,
					'mcfunction',
					{
						tabSize: 5,
					}
				)

				console.log('Colorization:')
				console.log(colorize)

				textDisplayElement.innerHTML = colorize
			} else {
				console.log('Text Element Null')
			}

			console.log(contents)

			console.log('Finished Tab Log')
		}
	}
}
