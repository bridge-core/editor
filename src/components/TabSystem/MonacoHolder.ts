import { editor } from 'monaco-editor'
import { Signal } from '../Common/Event/Signal'
import { settingsState } from '../Windows/Settings/SettingsState'

export class MonacoHolder extends Signal<void> {
	protected _monacoEditor?: editor.IStandaloneCodeEditor
	get monacoEditor() {
		if (!this._monacoEditor)
			throw new Error(`Accessed Monaco Editor before it was defined`)
		return this._monacoEditor
	}

	createMonacoEditor(domElement: HTMLElement) {
		this._monacoEditor?.dispose()
		this._monacoEditor = editor.create(domElement, {
			theme: `bridgeMonacoDefault`,
			roundedSelection: false,
			autoIndent: 'full',
			fontSize: 14,
			// fontFamily: this.fontFamily,
			wordWrap: settingsState?.editor?.wordWrap ? 'bounded' : 'off',
			tabSize: 4,
		})
		this._monacoEditor?.layout()
		this.dispatch()
	}

	updateOptions(options: editor.IEditorConstructionOptions) {
		this._monacoEditor?.updateOptions(options)
	}
}
