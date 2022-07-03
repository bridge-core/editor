import { TabSystem } from '../../TabSystem/TabSystem'
import { FileTab } from '/@/components/TabSystem/FileTab'
import HTMLPreviewTabComponent from './HTMLPreview.vue'
import { PreviewTab } from '../../TabSystem/PreviewTab'
import { IDisposable } from '/@/types/disposable'
import type { ThemeManager } from '/@/components/Extensions/Themes/ThemeManager'

export class HTMLPreviewTab extends PreviewTab {
	component = HTMLPreviewTabComponent
	public rawHtml = ''

	protected defaultStyles = ``
	protected themeListener?: IDisposable
	constructor(tab: FileTab, parent: TabSystem) {
		super(tab, parent)

		const themeManager = parent.app.themeManager
		this.updateDefaultStyles(themeManager)
		this.themeListener = themeManager.on(() =>
			this.updateDefaultStyles(themeManager)
		)
	}

	onDestroy(): void {
		this.themeListener?.dispose()
		this.themeListener = undefined
	}

	get icon() {
		return 'mdi-language-html5'
	}
	get iconColor() {
		return 'behaviorPack'
	}
	get name() {
		return `${this.parent.app.locales.translate('preview.name')}: ${
			this.tab.name
		}`
	}

	get html() {
		return (
			this.rawHtml.replaceAll('href="#', 'href="about:srcdoc#') +
			`<link
				rel="stylesheet"
				href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900"
			/>` +
			`<style>${this.defaultStyles}</style>`
		)
	}
	updateDefaultStyles(themeManager: ThemeManager) {
		this.defaultStyles = `html {
			color: ${themeManager.getColor('text')};
			font-family: Roboto;
		}
		
		a {
			color: ${themeManager.getColor('primary')};
		}
		
		textarea, input {
			background-color: ${themeManager.getColor('background')};
			color: ${themeManager.getColor('text')};
		}`
	}

	reload() {
		this.onChange()
	}
	async onChange() {
		this.rawHtml = await this.tab.getFile().then((file) => file.text())
	}
}
