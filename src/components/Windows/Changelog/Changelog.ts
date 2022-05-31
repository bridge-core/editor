import { BaseWindow } from '/@/components/Windows/BaseWindow'
import ChangelogComponent from './Changelog.vue'
import { App } from '/@/App'
import { baseUrl } from '/@/utils/baseUrl'
import { version } from '/@/utils/app/version'

export class ChangelogWindow extends BaseWindow {
	changelog: string | undefined
	version: string | undefined

	constructor() {
		super(ChangelogComponent)
		this.defineWindow()
	}

	async open() {
		const app = await App.getApp()
		app.windows.loadingWindow.open()

		await fetch(baseUrl + 'changelog.html')
			.then((response) => response.text())
			.then((html) => {
				this.changelog = html
				this.version = version
			})

		app.windows.loadingWindow.close()
		super.open()
	}
}
