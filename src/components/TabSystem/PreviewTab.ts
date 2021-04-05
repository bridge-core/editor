import { Tab } from './CommonTab'
import { TabSystem } from './TabSystem'

export abstract class PreviewTab<T> extends Tab<T> {
	public readonly isForeignFile = true
	static is() {
		return false
	}

	constructor(
		protected tab: Tab<T>,
		parent: TabSystem,
		fileHandle: FileSystemFileHandle
	) {
		super(parent, fileHandle)

		this.onCreate()
	}
	onCreate() {}
	async onActivate() {
		this.onChange()
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
