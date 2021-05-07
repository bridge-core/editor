import { FileTab } from '/@/components/TabSystem/FileTab'
import TreeTabComponent from './Tab.vue'
import { App } from '/@/App'
import { TabSystem } from '/@/components/TabSystem/TabSystem'
import { TreeEditor } from './TreeEditor'
import { parse } from 'json5'

export class TreeTab extends FileTab {
	component = TreeTabComponent
	_treeEditor?: TreeEditor

	constructor(parent: TabSystem, fileHandle: FileSystemFileHandle) {
		super(parent, fileHandle)
	}

	static is(fileHandle: FileSystemFileHandle) {
		// return false
		return fileHandle.name.endsWith('.json')
	}
	get treeEditor() {
		if (!this._treeEditor)
			throw new Error(`Trying to access TreeEditor before it was setup.`)
		return this._treeEditor
	}
	async setup() {
		this._treeEditor = new TreeEditor(
			parse(await this.fileHandle.getFile().then((file) => file.text()))
		)
		// @ts-ignore
		console.log(this.treeEditor.tree)

		await super.setup()
	}
	async getFile() {
		return new File([JSON.stringify(this.treeEditor.toJSON())], this.name)
	}

	async onActivate() {}
	onDeactivate() {}
	onDestroy() {}
	updateParent(parent: TabSystem) {}
	focus() {}

	loadEditor() {}

	async save() {}
	protected async saveFile(app: App) {}

	async paste() {}
}
