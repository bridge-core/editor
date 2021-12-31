import { FileTab } from '/@/components/TabSystem/FileTab'
import TreeTabComponent from './Tab.vue'
import { App } from '/@/App'
import { TabSystem } from '/@/components/TabSystem/TabSystem'
import { TreeEditor } from './TreeEditor'
import json5 from 'json5'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { debounce } from 'lodash-es'
import { InformationWindow } from '../../Windows/Common/Information/InformationWindow'
import { TreeValueSelection } from './TreeSelection'
import { PrimitiveTree } from './Tree/PrimitiveTree'
import { AnyFileHandle } from '../../FileSystem/Types'

const throttledCacheUpdate = debounce<(tab: TreeTab) => Promise<void> | void>(
	async (tab) => {
		const fileContent = JSON.stringify(tab.treeEditor.toJSON())
		const app = await App.getApp()
		await app.project.packIndexer.updateFile(
			tab.getPath(),
			fileContent,
			tab.isForeignFile,
			true
		)
		await app.project.jsonDefaults.updateDynamicSchemas(tab.getPath())

		app.project.fileChange.dispatch(tab.getPath(), await tab.getFile())
	},
	600
)

export class TreeTab extends FileTab {
	component = TreeTabComponent
	protected _treeEditor?: TreeEditor

	constructor(
		parent: TabSystem,
		fileHandle: AnyFileHandle,
		isReadOnly = false
	) {
		super(parent, fileHandle, isReadOnly)

		this.fired.then(async () => {
			const app = await App.getApp()
			await app.projectManager.projectReady.fired

			app.project.tabActionProvider.addTabActions(this)
		})
	}

	get app() {
		return this.parent.app
	}
	get project() {
		return this.parent.project
	}

	static is(fileHandle: AnyFileHandle) {
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
		let json: unknown
		try {
			json = json5.parse(
				await this.fileHandle.getFile().then((file) => file.text())
			)
		} catch {
			new InformationWindow({
				name: 'windows.invalidJson.title',
				description: 'windows.invalidJson.description',
			})
			this.close()
			return
		}

		this._treeEditor = new TreeEditor(this, json)

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
		this._treeEditor?.deactivate()
	}

	loadEditor() {}
	setReadOnly(val: boolean) {
		this.isReadOnly = val
	}

	async save() {
		this.isTemporary = false

		const app = await App.getApp()
		const fileContent = JSON.stringify(this.treeEditor.toJSON(), null, '\t')

		await app.fileSystem.write(this.fileHandle, fileContent)
		this.treeEditor.saveState()
	}

	async paste() {
		if (this.isReadOnly) return

		const text = await navigator.clipboard.readText()

		let data: any = undefined
		// Try parsing clipboard text
		try {
			data = json5.parse(text)
		} catch {
			// Parsing fails, now try again with brackets around text
			// -> To support pasting text like this: "minecraft:can_fly": {}
			try {
				data = json5.parse(`{${text}}`)
			} catch {
				return
			}
		}
		if (data === undefined) return

		this.treeEditor.addFromJSON(data)
	}

	async copy() {
		let copyText = ''

		this.treeEditor.forEachSelection((sel) => {
			const tree = sel.getTree()

			if (sel instanceof TreeValueSelection) {
				if ((<PrimitiveTree>tree).isValueSelected)
					copyText += tree.toJSON()
				else copyText += tree.key
			} else {
				copyText += `"${tree.key}": ${JSON.stringify(
					sel.getTree().toJSON(),
					null,
					'\t'
				)}`
			}
		})

		if (copyText !== '') await navigator.clipboard.writeText(copyText)
	}

	async cut() {
		if (this.isReadOnly) return

		await this.copy()
		this.treeEditor.forEachSelection((sel) =>
			this.treeEditor.delete(sel.getTree())
		)
	}

	async close() {
		const didClose = await super.close()

		// We need to clear the lightning cache store from temporary data if the user doesn't save changes
		if (!this.isForeignFile && didClose && this.isUnsaved) {
			// TODO: Well... this looks completely messed up. Look into what's the correct way to fix it. Should foreign files really get unlinked or can we just remove this?
			if (this.isForeignFile) {
				await this.app.fileSystem.unlink(this.getPath())
			} else {
				const file = await this.fileHandle.getFile()
				const fileContent = await file.text()
				await this.project.packIndexer.updateFile(
					this.getPath(),
					fileContent
				)
			}
		}

		return didClose
	}
}
