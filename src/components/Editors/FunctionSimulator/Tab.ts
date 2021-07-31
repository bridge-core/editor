import { FileTab } from '/@/components/TabSystem/FileTab'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'
import FunctionSimulatorTabComponent from './Tab.vue'
import { Tab } from '../../TabSystem/CommonTab'
import { App } from '/@/App'

export class FunctionSimulatorTab extends Tab {
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

		let file = await this.tab?.getFile()

		console.log(file)

		let contents = await file.text()

		console.log(contents)
	}
}
