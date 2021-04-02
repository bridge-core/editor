import { Tab } from './CommonTab'
import { TabSystem } from './TabSystem'
import { IDisposable } from '/@/types/disposable'

export abstract class PreviewTab<T> extends Tab<T> {
	protected disposables: IDisposable[] = []
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
		this.disposables.push(
			this.tab.change.on((data: T) => this.onChange(data))
		)
		this.onChange(this.getTabContent())
	}

	onDeactivate() {
		this.disposables.forEach((disposable) => disposable.dispose())
	}

	get name() {
		return `Preview: ${super.name}`
	}

	abstract onChange(data: T): Promise<void> | void

	save() {}
	getTabContent() {
		return this.tab.getTabContent()
	}
	reload() {
		this.onChange(this.getTabContent())
	}
}
