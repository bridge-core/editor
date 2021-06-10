import { FileTab } from '/@/components/TabSystem/FileTab'
import TreeTabComponent from './Tab.vue'
import { App } from '/@/App'
import { TabSystem } from '/@/components/TabSystem/TabSystem'
import { TreeEditor } from './TreeEditor'
import json5 from 'json5'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { debounce } from 'lodash-es'

const throttledCacheUpdate = debounce<(tab: TreeTab) => Promise<void> | void>(
	async (tab) => {
		const fileContent = JSON.stringify(tab.treeEditor.toJSON())
		const app = await App.getApp()
		await app.project.packIndexer.updateFile(
			tab.getProjectPath(),
			fileContent
		)
		await app.project.jsonDefaults.updateDynamicSchemas(
			tab.getProjectPath()
		)

		app.project.fileChange.dispatch(
			tab.getProjectPath(),
			await tab.getFile()
		)
	},
	600
)

export class TreeTab extends FileTab {
	component = TreeTabComponent
	_treeEditor?: TreeEditor

	constructor(parent: TabSystem, fileHandle: FileSystemFileHandle) {
		super(parent, fileHandle)

		this.fired.then(async () => {
			const app = await App.getApp()
			await app.projectManager.projectReady.fired

			app.project.tabActionProvider.addTabActions(this)
		})
	}

	static is(fileHandle: FileSystemFileHandle) {
		return (
			settingsState?.editor?.jsonEditor === 'treeEditor' &&
			fileHandle.name.endsWith('.json')
		)
	}
	get treeEditor() {
		if (!this._treeEditor)
			throw new Error(`Trying to access TreeEditor before it was setup.`)
		return this._treeEditor
	}
	async setup() {
		this._treeEditor = new TreeEditor(
			this,
			json5.parse(
				await this.fileHandle.getFile().then((file) => file.text())
			)
		)
		// @ts-ignore
		console.log(this.treeEditor.tree)

		await super.setup()
	}
	async getFile() {
		return new File([JSON.stringify(this.treeEditor.toJSON())], this.name)
	}

	updateCache() {
		throttledCacheUpdate(this)
	}

	async onActivate() {
		this.treeEditor.activate()
	}
	onDeactivate() {
		this.treeEditor.deactivate()
	}
	onDestroy() {}
	updateParent(parent: TabSystem) {}
	focus() {}

	loadEditor() {}

	async save() {
		const app = await App.getApp()
		const fileContent = JSON.stringify(this.treeEditor.toJSON(), null, '\t')

		await app.fileSystem.write(this.fileHandle, fileContent)
		this.treeEditor.saveState()
	}

	async paste() {}
}
