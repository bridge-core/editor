import { Tab } from '@/components/TabSystem/CommonTab'
import MonacoEditor from './Main.vue'
import * as monaco from 'monaco-editor'
import { Disposable } from '@/types/disposable'
import { on } from '@/appCycle/EventSystem'

export class TextTab extends Tab {
	component = MonacoEditor
	editorInstance: monaco.editor.IStandaloneCodeEditor | undefined
	editorModel: monaco.editor.ITextModel | undefined
	editorViewState: monaco.editor.ICodeEditorViewState | undefined
	disposables: Disposable[] = []

	receiveEditorInstance(editorInstance: monaco.editor.IStandaloneCodeEditor) {
		if (this.editorInstance) return

		this.editorInstance = editorInstance
		this.disposables.push(
			on('bridge:onResize', () => this.editorInstance?.layout())
		)
		this.editorInstance.layout()
	}

	async onActivate() {
		if (this.editorModel === undefined) {
			const file = await (await this.fileSystem).readFile(this.path)
			const fileContent = await file.text()

			this.editorModel = monaco.editor.createModel(
				fileContent,
				undefined,
				monaco.Uri.file(this.path.join('/'))
			)
			this.loadEditor()
		} else {
			this.loadEditor()
		}
	}
	onDeactivate() {
		this.editorViewState = this.editorInstance?.saveViewState() ?? undefined
	}
	onDestroy() {
		this.editorModel?.dispose()
		this.disposables.forEach(disposable => disposable.dispose())
	}

	loadEditor() {
		if (this.editorModel) this.editorInstance?.setModel(this.editorModel)
		if (this.editorViewState)
			this.editorInstance?.restoreViewState(this.editorViewState)

		this.editorModel?.onDidChangeContent(() => {
			this.isUnsaved = true
		})
	}

	async save() {
		this.isUnsaved = false
		if (this.editorModel) {
			await (await this.fileSystem).writeFile(
				this.path,
				this.editorModel.getValue()
			)
		}
	}
}
