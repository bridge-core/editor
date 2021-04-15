import { editor, languages, Range, Uri } from 'monaco-editor'
import { Signal } from '../Common/Event/Signal'
import { settingsState } from '../Windows/Settings/SettingsState'
import { App } from '/@/App'
import { IDisposable } from '/@/types/disposable'
import { DefinitionProvider } from '../Definitions/GoTo'

languages.typescript.javascriptDefaults.setCompilerOptions({
	target: languages.typescript.ScriptTarget.ESNext,
	allowNonTsExtensions: true,
	noLib: true,
	alwaysStrict: true,
})

languages.registerDefinitionProvider('json', new DefinitionProvider())
export class MonacoHolder extends Signal<void> {
	protected _monacoEditor?: editor.IStandaloneCodeEditor
	protected windowResize?: IDisposable

	constructor(protected _app: App) {
		super()
	}

	get monacoEditor() {
		if (!this._monacoEditor)
			throw new Error(`Accessed Monaco Editor before it was defined`)
		return this._monacoEditor
	}

	createMonacoEditor(domElement: HTMLElement) {
		this.dispose()
		this._monacoEditor = editor.create(domElement, {
			theme: `bridgeMonacoDefault`,
			roundedSelection: false,
			autoIndent: 'full',
			fontSize: 14,
			// fontFamily: this.fontFamily,
			wordWrap: settingsState?.editor?.wordWrap ? 'bounded' : 'off',
			tabSize: 4,
		})
		// @ts-ignore
		const editorService = this._monacoEditor._codeEditorService
		const openEditorBase = editorService.openCodeEditor.bind(editorService)
		editorService.openCodeEditor = async (
			input: any,
			source: any,
			sideBySide?: boolean
		) => {
			let result = await openEditorBase(input, source, sideBySide)

			if (!result) {
				try {
					await this._app.project.tabSystem?.openPath(
						input.resource.path.slice(1)
					)
				} catch {
					console.error(
						`Failed to open file "${input.resource.path.slice(1)}"`
					)
				}

				// source.setModel(editor.getModel(input.resource));
			}
			return result // always return the base result
		}

		this._monacoEditor?.layout()
		this.windowResize = this._app.windowResize.on(() =>
			setTimeout(() => this._monacoEditor?.layout())
		)
		this.dispatch()
	}

	updateOptions(options: editor.IEditorConstructionOptions) {
		this._monacoEditor?.updateOptions(options)
	}

	dispose() {
		this._monacoEditor?.dispose()
		this.windowResize?.dispose()
	}
}
