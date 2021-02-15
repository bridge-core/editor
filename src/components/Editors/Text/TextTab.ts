import { Tab } from '@/components/TabSystem/CommonTab'
import TextTabComponent from './TextTab.vue'
import * as monaco from 'monaco-editor'
import { IDisposable } from '@/types/disposable'
import debounce from 'lodash.debounce'
import { App } from '@/App'
import { TabSystem } from '@/components/TabSystem/TabSystem'

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
		this.editorInstance = editorInstance
		this.editorInstance.layout()
	}

	async onActivate() {
		const app = await App.getApp()
		this.editorInstance?.focus()
		this.editorInstance?.layout()

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
			this.editorModel?.onDidChangeContent(event => {
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
		this.disposables.forEach(disposable => disposable?.dispose())
	}
	onDestroy() {
		this.editorModel?.dispose()
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
