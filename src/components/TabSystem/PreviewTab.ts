import { Tab } from './CommonTab'
import { TabSystem } from './TabSystem'

export abstract class PreviewTab extends Tab {
	public readonly isForeignFile = true
	static is() {
		return false
	}

	constructor(
		protected tab: Tab,
		parent: TabSystem,
		fileHandle: FileSystemFileHandle
	) {
		super(parent, fileHandle)

		this.onCreate()
	}
	onCreate() {}
	async onActivate() {
		this.onChange()
		this.isActive = true
	}

	get name() {
		return `Preview: ${super.name}`
	}

	abstract onChange(): Promise<void> | void

	save() {}
	getFile() {
		return this.tab.getFile()
	}
	abstract reload(): Promise<void> | void
}
