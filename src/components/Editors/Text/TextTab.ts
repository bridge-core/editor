import { Tab } from '/@/components/TabSystem/CommonTab'
import TextTabComponent from './TextTab.vue'
import * as monaco from 'monaco-editor'
import { IDisposable } from '/@/types/disposable'
import { App } from '/@/App'
import { TabSystem } from '/@/components/TabSystem/TabSystem'
import { settingsState } from '../../Windows/Settings/SettingsState'

export class TextTab extends Tab {
	component = TextTabComponent
	editorInstance: monaco.editor.ICodeEditor | undefined
	editorModel: monaco.editor.ITextModel | undefined
	editorViewState: monaco.editor.ICodeEditorViewState | undefined
	disposables: (IDisposable | undefined)[] = []
	isActive = false

	setIsUnsaved(val: boolean) {
		super.setIsUnsaved(val)
	}

	receiveEditorInstance(editorInstance: monaco.editor.IStandaloneCodeEditor) {
		this.editorInstance = editorInstance
		this.editorInstance.layout()
	}

	async onActivate() {
		if (this.isActive) return
		this.isActive = true

		const app = await App.getApp()
		this.editorInstance?.focus()
		this.editorInstance?.layout()

		if (!this.editorModel) {
			const file = await app.fileSystem.readFile(this.path)
			const fileContent = await file.text()
			this.editorModel = monaco.editor.createModel(
				fileContent,
				undefined,
				monaco.Uri.file(this.path)
			)
			this.loadEditor()
		} else {
			this.loadEditor()
		}

		this.disposables.push(
			app.windowResize.on(() => this.editorInstance?.layout())
		)
		this.disposables.push(
			this.editorModel?.onDidChangeContent((event) => {
				this.isUnsaved = true
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
		this.editorInstance = undefined
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

		if (action && (settingsState?.general?.formatOnSave ?? true)) {
			app.windows.loadingWindow.open()
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
			await app.fileSystem.writeFile(
				this.path,
				this.editorModel.getValue()
			)
		}
	}

	async paste() {
		this.editorInstance?.trigger('keyboard', 'paste', {
			text: await navigator.clipboard.readText(),
		})
	}
}
