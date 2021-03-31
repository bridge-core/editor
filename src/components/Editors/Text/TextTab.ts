import { Tab } from '/@/components/TabSystem/CommonTab'
import TextTabComponent from './TextTab.vue'
import * as monaco from 'monaco-editor'
import { IDisposable } from '/@/types/disposable'
import { App } from '/@/App'
import { TabSystem } from '/@/components/TabSystem/TabSystem'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { FileType } from '/@/components/Data/FileType'
import { debounce } from 'lodash'

const throttledCacheUpdate = debounce<(tab: TextTab) => Promise<void> | void>(
	async (tab) => {
		if (!tab.editorModel) return

		const app = await App.getApp()
		await app.project.packIndexer.updateFile(
			tab.getProjectPath(),
			tab.editorModel?.getValue()
		)
		await app.project.jsonDefaults.updateDynamicSchemas(
			tab.getProjectPath()
		)
	},
	600
)

export class TextTab extends Tab {
	component = TextTabComponent
	editorModel: monaco.editor.ITextModel | undefined
	editorViewState: monaco.editor.ICodeEditorViewState | undefined
	disposables: (IDisposable | undefined)[] = []
	isActive = false

	get editorInstance() {
		return this.parent.monacoEditor
	}

	setIsUnsaved(val: boolean) {
		super.setIsUnsaved(val)
	}

	async onActivate() {
		if (this.isActive) return
		this.isActive = true

		const app = await App.getApp()
		await this.parent.fired //Make sure a monaco editor is loaded
		this.editorInstance?.focus()
		this.editorInstance?.layout()

		if (!this.editorModel) {
			const file = await this.fileHandle.getFile()
			const fileContent = await file.text()

			this.editorModel = monaco.editor.createModel(
				fileContent,
				undefined,
				monaco.Uri.file(this.getPath())
			)
			this.loadEditor()
		} else {
			this.loadEditor()
		}

		this.disposables.push(
			app.windowResize.on(() => this.editorInstance?.layout())
		)
		this.disposables.push(
			this.editorModel?.onDidChangeContent(() => {
				this.isUnsaved = true
				throttledCacheUpdate(this)
			})
		)
		this.disposables.push(
			this.editorInstance?.onDidFocusEditorText(() => {
				this.parent.setActive(true)
			})
		)
	}
	onDeactivate() {
		this.editorViewState = this.editorInstance?.saveViewState() ?? undefined
		this.disposables.forEach((disposable) => disposable?.dispose())
		this.isActive = false
	}
	onDestroy() {
		this.disposables.forEach((disposable) => disposable?.dispose())
		this.editorModel?.dispose()
		this.editorViewState = undefined
		this.isActive = false
	}
	updateParent(parent: TabSystem) {
		super.updateParent(parent)
	}
	focus() {
		this.editorInstance?.focus()
	}

	loadEditor() {
		if (this.editorModel) this.editorInstance?.setModel(this.editorModel)
		if (this.editorViewState)
			this.editorInstance?.restoreViewState(this.editorViewState)
	}

	async save() {
		const app = await App.getApp()
		const action = this.editorInstance?.getAction(
			'editor.action.formatDocument'
		)
		const fileType = FileType.get(this.getProjectPath())

		if (
			action &&
			(settingsState?.general?.formatOnSave ?? true) &&
			(fileType?.formatOnSaveCapable ?? true)
		) {
			app.windows.loadingWindow.open()
			// This is a terrible hack because we need to make sure that the formatter triggers the "onDidChangeContent" event
			// The promise returned by action.run() actually resolves before formatting is done so we need the "onDidChangeContent" event to tell when the formatter is done
			this.editorInstance?.executeEdits('automatic', [
				{
					forceMoveMarkers: false,
					range: {
						startLineNumber: 0,
						endLineNumber: 0,
						startColumn: 0,
						endColumn: 0,
					},
					text: '\t',
				},
			])

			const disposable = this.editorModel?.onDidChangeContent(
				async () => {
					disposable?.dispose()

					await this.saveFile(app)

					app.windows.loadingWindow.close()
				}
			)

			await action.run()
		} else {
			await this.saveFile(app)
		}
	}
	protected async saveFile(app: App) {
		this.isUnsaved = false
		if (this.editorModel) {
			await app.fileSystem.write(
				this.fileHandle,
				this.editorModel.getValue()
			)
		}
	}

	async paste() {
		this.editorInstance?.trigger('keyboard', 'paste', {
			text: await navigator.clipboard.readText(),
		})
	}
	async close() {
		super.close()

		// We need to clear the lightning cache store from temporary data if the user doesn't save changes
		if (this.isUnsaved) {
			const app = await App.getApp()
			const file = await app.fileSystem.readFile(this.getPath())
			const fileContent = await file.text()
			await app.project.packIndexer.updateFile(
				this.getProjectPath(),
				fileContent
			)
		}
	}
}
