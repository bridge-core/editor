import { Tab } from '@/components/TabSystem/CommonTab'
import TextTabComponent from './TextTab.vue'
import * as monaco from 'monaco-editor'
import { IDisposable } from '@/types/disposable'
import debounce from 'lodash.debounce'
import { App } from '@/App'

export class TextTab extends Tab {
	component = TextTabComponent
	editorInstance: monaco.editor.ICodeEditor | undefined
	editorModel: monaco.editor.ITextModel | undefined
	editorViewState: monaco.editor.ICodeEditorViewState | undefined
	disposables: (IDisposable | undefined)[] = []

	setIsUnsaved(val: boolean) {
		super.setIsUnsaved(val)
	}

	receiveEditorInstance(editorInstance: monaco.editor.IStandaloneCodeEditor) {
		if (this.editorInstance) return

		this.editorInstance = editorInstance
		this.editorInstance.layout()
	}

	async onActivate() {
		const app = await App.getApp()

		if (this.editorModel === undefined) {
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
			this.editorModel?.onDidChangeContent(
				debounce(event => {
					this.isUnsaved = true
				}, 500)
			)
		)
	}
	onDeactivate() {
		this.editorViewState = this.editorInstance?.saveViewState() ?? undefined
		this.disposables.forEach(disposable => disposable?.dispose())
	}
	onDestroy() {
		this.editorModel?.dispose()
	}

	loadEditor() {
		if (this.editorModel) this.editorInstance?.setModel(this.editorModel)
		if (this.editorViewState)
			this.editorInstance?.restoreViewState(this.editorViewState)
	}

	async save() {
		const app = await App.getApp()

		this.isUnsaved = false
		if (this.editorModel) {
			await app.fileSystem.writeFile(
				this.path,
				this.editorModel.getValue()
			)
		}
	}
}
