import { AnyFileHandle } from '../../FileSystem/Types'
import { TabSystem } from '../../TabSystem/TabSystem'
import { FileTab } from '/@/components/TabSystem/FileTab'
import HTMLPreviewTabComponent from './HTMLPreview.vue'
import { PreviewTab } from '../../TabSystem/PreviewTab'

export class HTMLPreviewTab extends PreviewTab {
	component = HTMLPreviewTabComponent
	public html = ''
	constructor(tab: FileTab, parent: TabSystem) {
		super(tab, parent)
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

	reload() {
		this.onChange()
	}
	async onChange() {
		this.html = await this.tab.getFile().then((file) => file.text())
	}
}
