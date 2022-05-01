import { FileTab } from '/@/components/TabSystem/FileTab'
import JigsawTabComponent from './Tab.vue'
import { App } from '/@/App'
import { TabSystem } from '/@/components/TabSystem/TabSystem'
import json5 from 'json5'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { debounce } from 'lodash-es'
import { InformationWindow } from '../../Windows/Common/Information/InformationWindow'
import { AnyFileHandle } from '../../FileSystem/Types'

const throttledCacheUpdate = debounce<(tab: JigsawTab) => Promise<void> | void>(
	async (tab) => {
		const fileContent = JSON.stringify({
			// TODO: Get JSON from jigsaw tab
		})
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

export class JigsawTab extends FileTab {
	component = JigsawTabComponent

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
			settingsState?.editor?.jsonEditor === 'jigsawEditor' &&
			fileHandle.name.endsWith('.json')
		)
	}
	async setup() {
		let json: unknown
		try {
			const fileStr = await this.fileHandle
				.getFile()
				.then((file) => file.text())

			if (fileStr === '') json = {}
			else json = json5.parse(fileStr)
		} catch {
			new InformationWindow({
				name: 'windows.invalidJson.title',
				description: 'windows.invalidJson.description',
			})
			this.close()
			return
		}

		await super.setup()
	}
	async getFile() {
		return new File(
			[
				JSON.stringify({
					// TODO: Get JSON from jigsaw tab
				}),
			],
			this.name
		)
	}

	updateCache() {
		throttledCacheUpdate(this)
	}

	async onActivate() {}
	onDeactivate() {}

	loadEditor() {}
	setReadOnly(val: boolean) {
		this.isReadOnly = val
	}

	async save() {
		this.isTemporary = false

		const app = await App.getApp()
		const fileContent = JSON.stringify(
			{
				// TODO: Stringify jigsaw editor here
			},
			null,
			'\t'
		)

		await app.fileSystem.write(this.fileHandle, fileContent)
	}

	async paste() {}

	async copy() {}

	async cut() {}

	async close() {
		const didClose = await super.close()

		// We need to clear the lightning cache store from temporary data if the user doesn't save changes
		if (!this.isForeignFile && didClose && this.isUnsaved) {
			const file = await this.fileHandle.getFile()
			const fileContent = await file.text()
			await this.project.packIndexer.updateFile(
				this.getPath(),
				fileContent
			)
		}

		return didClose
	}
}
