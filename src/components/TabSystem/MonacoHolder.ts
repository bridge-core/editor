import { editor } from 'monaco-editor'
import { settingsState } from '../Windows/Settings/SettingsState'

export class MonacoHolder {
	protected _monacoEditor?: editor.IStandaloneCodeEditor
	get monacoEditor() {
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
	}

	updateOptions(options: editor.IEditorConstructionOptions) {
		this._monacoEditor?.updateOptions(options)
	}
}
