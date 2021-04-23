import { Tab } from './CommonTab'
import { TabSystem } from './TabSystem'
import { v4 as uuid } from 'uuid'

export abstract class FileTab extends Tab {
	public isForeignFile = false

	constructor(
		protected parent: TabSystem,
		protected fileHandle: FileSystemFileHandle
	) {
		super(parent)
	}

	async setup() {
		this.projectPath = await this.parent.projectRoot
			.resolve(this.fileHandle)
			.then((path) => path?.join('/'))

		// If the resolve above failed, we are dealing with a file which doesn't belong to this project
		if (!this.projectPath) {
			this.isForeignFile = true
			this.projectPath = `${uuid()}/${this.fileHandle.name}`
		}

		await super.setup()
	}

	get name() {
		return this.fileHandle.name
	}

	async isFor(fileHandle: FileSystemFileHandle) {
		return await fileHandle.isSameEntry(this.fileHandle)
	}

	async getFile() {
		return await this.fileHandle.getFile()
	}
}
