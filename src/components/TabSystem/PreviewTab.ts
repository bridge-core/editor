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
		this.onChange(await this.getFile())
	}

	get name() {
		return `Preview: ${super.name}`
	}

	abstract onChange(data: File): Promise<void> | void

	save() {}
	getFile() {
		return this.tab.getFile()
	}
	async reload() {
		this.onChange(await this.getFile())
	}
}
