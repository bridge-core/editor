import { BaseWindow } from '@/components/Windows/BaseWindow'
import ChangelogComponent from './Changelog.vue'
import { App } from '@/App'

const MarkdownIt = require('markdown-it')

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

		await fetch('https://api.github.com/repos/bridge-core/editor/releases')
			.then(response => response.json())
			.then(data => {
				this.changelog = this.parseMarkdown(data[0].body)
				this.version = data[0].name
			})

		app.windows.loadingWindow.close()
		super.open()
	}

	parseMarkdown(markdown: string) {
		let md = new MarkdownIt
		return md.render(markdown)
	}
}