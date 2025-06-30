import { FileTab, TReadOnlyMode } from '/@/components/TabSystem/FileTab'
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
import { HistoryEntry } from './History/HistoryEntry'
import { readText, writeText } from '@tauri-apps/api/clipboard'

const throttledCacheUpdate = debounce<(tab: TreeTab) => Promise<void> | void>(
	async (tab) => {
		const fileContent = tab.treeEditor.toJsonString()
		const app = await App.getApp()

		app.project.fileChange.dispatch(tab.getPath(), await tab.getFile())

		await app.project.packIndexer.updateFile(
			tab.getPath(),
			fileContent,
			tab.isForeignFile,
			true
		)
		await app.project.jsonDefaults.updateDynamicSchemas(tab.getPath())
	},
	600
)

export class TreeTab extends FileTab {
	component = TreeTabComponent
	protected _treeEditor?: TreeEditor

	constructor(
		parent: TabSystem,
		fileHandle: AnyFileHandle,
		readOnlyMode?: TReadOnlyMode
	) {
		super(parent, fileHandle, readOnlyMode)

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
			const fileStr = await this.fileHandle
				.getFile()
				.then((file) => file.text())

			if (fileStr === '') json = {}
			else json = json5.parse(fileStr.replaceAll('\\n', '\\\\n'))
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
		return new File([this.treeEditor.toJsonString()], this.name)
	}

	updateCache() {
		throttledCacheUpdate(this)
	}

	async onActivate() {
		await super.onActivate()

		this.treeEditor.activate()
	}
	async onDeactivate() {
		await super.onDeactivate()

		this._treeEditor?.deactivate()
	}

	loadEditor() {}
	setReadOnly(val: TReadOnlyMode) {
		this.readOnlyMode = val
	}

	async _save() {
		this.isTemporary = false

		const fileContent = this.treeEditor.toJsonString(true)

		const writeWorked = await this.writeFile(fileContent)
		if (writeWorked) this.treeEditor.saveState()
	}

	async paste() {
		if (this.isReadOnly) return

		const text = import.meta.env.VITE_IS_TAURI_APP
			? String(await readText())
			: await navigator.clipboard.readText()

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

		if (copyText !== '')
			import.meta.env.VITE_IS_TAURI_APP
				? String(await writeText(copyText))
				: await navigator.clipboard.writeText(copyText)
	}

	async cut() {
		if (this.isReadOnly) return

		await this.copy()
		const entries: HistoryEntry[] = []
		this.treeEditor.forEachSelection((sel) => {
			sel.dispose()
			const entry = sel.delete()
			if (entry) entries.push(entry)
		})

		this.treeEditor.pushAllHistoryEntries(entries)
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
