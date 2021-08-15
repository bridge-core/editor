import { editor, KeyCode, KeyMod, languages } from 'monaco-editor'
import { Signal } from '../Common/Event/Signal'
import { settingsState } from '../Windows/Settings/SettingsState'
import { App } from '/@/App'
import { IDisposable } from '/@/types/disposable'
import { DefinitionProvider } from '../Definitions/GoTo'
import { getJsonWordAtPosition } from '/@/utils/monaco/getJsonWord'
import { viewDocumentation } from '../Documentation/view'
import { isWithinQuotes } from '/@/utils/monaco/withinQuotes'
import { markRaw } from '@vue/composition-api'

languages.typescript.javascriptDefaults.setCompilerOptions({
	target: languages.typescript.ScriptTarget.ESNext,
	allowNonTsExtensions: true,
	noLib: true,
	alwaysStrict: true,
})

languages.registerDefinitionProvider('json', new DefinitionProvider())

export class MonacoHolder extends Signal<void> {
	protected _monacoEditor?: editor.IStandaloneCodeEditor
	protected disposables: IDisposable[] = []

	constructor(protected _app: App) {
		super()
	}

	get monacoEditor() {
		if (!this._monacoEditor)
			throw new Error(`Accessed Monaco Editor before it was defined`)
		return this._monacoEditor
	}

	getMobileOptions(isMobile: boolean) {
		return <const>{
			lineNumbers: isMobile ? 'off' : 'on',
			minimap: { enabled: !isMobile },
			tabSize: isMobile ? 2 : 4,
			scrollbar: {
				horizontalScrollbarSize: isMobile ? 15 : undefined,
				verticalScrollbarSize: isMobile ? 20 : undefined,
				horizontalSliderSize: isMobile ? 15 : undefined,
				verticalSliderSize: isMobile ? 20 : undefined,
			},
		}
	}

	createMonacoEditor(domElement: HTMLElement) {
		this.dispose()
		this._monacoEditor = markRaw(
			editor.create(domElement, {
				wordBasedSuggestions: false,
				theme: `bridgeMonacoDefault`,
				roundedSelection: false,
				autoIndent: 'full',
				fontSize: 14,
				...this.getMobileOptions(this._app.mobile.isCurrentDevice()),
				// fontFamily: this.fontFamily,
				wordWrap: settingsState?.editor?.wordWrap ? 'bounded' : 'off',
				wordWrapColumn: Number(
					settingsState?.editor?.wordWrapColumns ?? '80'
				),
			})
		)
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

		// Workaround to make the toggleLineComment action work
		const commentLineAction = this._monacoEditor.getAction(
			'editor.action.commentLine'
		)
		this._monacoEditor?.addAction({
			...commentLineAction,

			keybindings: [KeyMod.CtrlCmd | KeyCode.US_BACKSLASH],
			run(...args: any[]) {
				// @ts-ignore
				this._run(...args)
			},
		})
		this.monacoEditor.addAction({
			id: 'documentationLookup',
			label: this._app.locales.translate(
				'actions.documentationLookup.name'
			),
			contextMenuGroupId: 'navigation',
			run: (editor: editor.IStandaloneCodeEditor) => {
				const currentModel = editor.getModel()
				const selection = editor.getSelection()
				if (!currentModel || !selection) return

				const filePath = this._app.tabSystem?.selectedTab?.getProjectPath()
				if (!filePath) return

				let word: string | undefined
				if (filePath.endsWith('.json'))
					word = getJsonWordAtPosition(
						currentModel,
						selection.getPosition()
					).word
				else
					word = currentModel.getWordAtPosition(
						selection.getPosition()
					)?.word

				viewDocumentation(filePath, word)
			},
		})

		// This snippet configures some extra trigger characters for JSON
		this._monacoEditor.onDidChangeModelContent((event) => {
			const filePath = this._app.tabSystem?.selectedTab?.getProjectPath()
			if (!filePath) return

			if (!filePath.endsWith('.json')) return

			const model = this._monacoEditor?.getModel()
			const position = this._monacoEditor?.getSelection()?.getPosition()

			// Better auto-complete within quotes that represent MoLang/commands
			if (model && position && isWithinQuotes(model, position)) {
				if (event.changes.some((change) => change.text === ' ')) {
					// Timeout is needed for some reason. Otherwise the auto-complete menu doesn't show up
					setTimeout(() => {
						this._monacoEditor?.trigger(
							'auto',
							'editor.action.triggerSuggest',
							{}
						)
					}, 50)
				}
			}

			// Monaco currently doesn't include " as a trigger character. This snippet works artificially makes it so
			if (event.changes.some((change) => change.text === '""')) {
				this._monacoEditor?.trigger(
					'auto',
					'editor.action.triggerSuggest',
					{}
				)
			}
		})

		this._monacoEditor?.layout()
		this.disposables.push(
			this._app.windowResize.on(() =>
				setTimeout(() => this._monacoEditor?.layout())
			)
		)
		this.disposables.push(
			this._app.mobile.change.on((isMobile) => {
				this._monacoEditor?.updateOptions(
					this.getMobileOptions(isMobile)
				)
			})
		)

		this.dispatch()
	}

	updateOptions(options: editor.IEditorConstructionOptions) {
		this._monacoEditor?.updateOptions(options)
	}

	dispose() {
		this._monacoEditor?.dispose()
		this.disposables.forEach((d) => d.dispose())
		this.disposables = []
		this._monacoEditor = undefined
	}
}
