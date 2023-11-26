import { translate } from '../Locales/Manager'
import { Tab } from './CommonTab'
import { FileTab } from './FileTab'
import { TabSystem } from './TabSystem'

export abstract class PreviewTab extends Tab {
	public readonly isForeignFile = true
	static is() {
		return false
	}

	constructor(protected tab: FileTab, parent: TabSystem) {
		super(parent)

		this.onCreate()
	}
	onCreate() {}
	async onActivate() {
		this.onChange()
		this.isActive = true
	}

	get name() {
		return `${translate('preview.name')}: ${this.tab.name}`
	}

	abstract onChange(): Promise<void> | void

	save() {}
	getFile() {
		return this.tab.getFile()
	}
	abstract reload(): Promise<void> | void
}
