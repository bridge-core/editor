import type { editor, KeyCode, KeyMod } from 'monaco-editor'
import { Signal } from '../../libs/event/Signal'
import { settingsState } from '../Windows/Settings/SettingsState'
import { App } from '/@/App'
import { IDisposable } from '/@/types/disposable'
import { DefinitionProvider } from '../Definitions/GoTo'
import { getJsonWordAtPosition } from '/@/libs/monaco/getJsonWord'
import { viewDocumentation } from '../Documentation/view'
import { isWithinQuotes } from '/@/libs/monaco/withinQuotes'
import { markRaw } from 'vue'
import { debounce } from 'lodash-es'
import { platform } from '/@/libs/os'
import { showContextMenu } from '../ContextMenu/showContextMenu'
import { TextTab } from '../Editors/Text/TextTab'
import { useMonaco } from '../../libs/libs/useMonaco'
import { registerTextSnippetProvider } from '../Snippets/Monaco'
import { anyMonacoThemeLoaded } from '../Extensions/Themes/MonacoSubTheme'

let configuredMonaco = false

export class MonacoHolder extends Signal<void> {
	protected _monacoEditor?: editor.IStandaloneCodeEditor
	protected disposables: IDisposable[] = []

	constructor(protected _app: App) {
		super()

		if (!configuredMonaco) {
			configuredMonaco = true
			useMonaco().then(({ languages }) => {
				languages.typescript.javascriptDefaults.setCompilerOptions({
					target: languages.typescript.ScriptTarget.ESNext,
					allowNonTsExtensions: true,
					alwaysStrict: true,
					checkJs: true,
				})
				languages.typescript.typescriptDefaults.setCompilerOptions({
					target: languages.typescript.ScriptTarget.ESNext,
					allowNonTsExtensions: true,
					alwaysStrict: true,
					moduleResolution:
						languages.typescript.ModuleResolutionKind.NodeJs,
					module: languages.typescript.ModuleKind.ESNext,
				})

				languages.registerDefinitionProvider(
					'json',
					new DefinitionProvider()
				)

				registerTextSnippetProvider()
			})
		}
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

	async createMonacoEditor(domElement: HTMLElement) {
		const { KeyCode, KeyMod, editor } = await useMonaco()

		// Don't mount editor before theme is loaded
		await anyMonacoThemeLoaded.fired

		this.dispose()
		this._monacoEditor = markRaw(
			editor.create(domElement, {
				wordBasedSuggestions: false,
				theme: `bridgeMonacoDefault`,
				roundedSelection: false,
				autoIndent: 'full',
				fontSize: Number(
					(
						<string>settingsState?.appearance?.editorFontSize ??
						'14px'
					).replace('px', '')
				),
				// @ts-expect-error The monaco team did not update the types yet
				'bracketPairColorization.enabled':
					settingsState?.editor?.bracketPairColorization ?? false,
				fontFamily:
					(<string>settingsState?.appearance?.editorFont ??
						(platform() === 'darwin' ? 'Menlo' : 'Consolas')) +
					', monospace',
				...this.getMobileOptions(this._app.mobile.isCurrentDevice()),
				contextmenu: false,
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
		editorService.openCodeEditor = debounce(
			async (input: any, source: any, sideBySide?: boolean) => {
				let result = await openEditorBase(input, source, sideBySide)

				if (!result) {
					try {
						const currentTab = this._app.tabSystem?.selectedTab
						if (currentTab) currentTab.isTemporary = false

						await this._app.project.tabSystem?.openPath(
							input.resource.path.slice(1)
						)
					} catch {
						console.error(
							`Failed to open file "${input.resource.path.slice(
								1
							)}"`
						)
					}

					// source.setModel(editor.getModel(input.resource));
				}
				return result // always return the base result
			},
			100
		)

		// Workaround to make the toggleLineComment action work
		const commentLineAction = this._monacoEditor.getAction(
			'editor.action.commentLine'
		)
		this._monacoEditor.addAction({
			...commentLineAction,

			keybindings: [KeyMod.CtrlCmd | KeyCode.Backslash],
			run(...args: any[]) {
				// @ts-ignore
				this._run(...args)
			},
		})

		// This snippet configures some extra trigger characters for JSON
		this._monacoEditor.onDidChangeModelContent((event) => {
			const filePath = this._app.tabSystem?.selectedTab?.getPath()
			if (!filePath) return

			if (!App.fileType.isJsonFile(filePath)) return

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
		})

		this._monacoEditor.layout()
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
		this.resetSignal()
	}

	private onReadonlyCustomMonacoContextMenu() {
		return [
			{
				name: 'actions.documentationLookup.name',
				icon: 'mdi-book-open-outline',
				onTrigger: async () => {
					const currentModel = this._monacoEditor?.getModel()
					const selection = this._monacoEditor?.getSelection()
					if (!currentModel || !selection) return

					const filePath = this._app.tabSystem?.selectedTab?.getPath()
					if (!filePath) return

					let word: string | undefined
					if (App.fileType.isJsonFile(filePath))
						word = await getJsonWordAtPosition(
							currentModel,
							selection.getPosition()
						).then((res) => res.word)
					else
						word = currentModel.getWordAtPosition(
							selection.getPosition()
						)?.word

					viewDocumentation(filePath, word)
				},
			},
			{
				name: 'actions.goToDefinition.name',
				icon: 'mdi-magnify',
				onTrigger: () => {
					this._monacoEditor?.trigger(
						'contextmenu',
						'editor.action.revealDefinition',
						null
					)
				},
			},
			{
				name: 'actions.goToSymbol.name',
				icon: 'mdi-at',
				onTrigger: () => {
					setTimeout(() => {
						this._monacoEditor?.focus()
						this._monacoEditor?.trigger(
							'contextmenu',
							'editor.action.quickOutline',
							null
						)
					})
				},
			},
		]
	}

	showCustomMonacoContextMenu(event: MouseEvent, tab: TextTab) {
		if (tab.isReadOnly)
			return showContextMenu(
				event,
				this.onReadonlyCustomMonacoContextMenu()
			)

		showContextMenu(event, [
			...this.onReadonlyCustomMonacoContextMenu(),
			{ type: 'divider' },
			{
				name: 'actions.changeAllOccurrences.name',
				icon: 'mdi-pencil-outline',
				onTrigger: () => {
					this._monacoEditor?.trigger(
						'contextmenu',
						'editor.action.rename',
						null
					)
				},
			},

			{
				name: 'actions.formatDocument.name',
				icon: 'mdi-text-box-check-outline',
				onTrigger: () => {
					this._monacoEditor?.trigger(
						'contextmenu',
						'editor.action.formatDocument',
						null
					)
				},
			},
			{ type: 'divider' },
			{
				name: 'actions.copy.name',
				icon: 'mdi-content-copy',
				onTrigger: () => {
					document.execCommand('copy')
				},
			},
			{
				name: 'actions.cut.name',
				icon: 'mdi-content-cut',
				onTrigger: () => {
					tab.cut()
				},
			},
			{
				name: 'actions.paste.name',
				icon: 'mdi-content-paste',
				onTrigger: () => {
					tab.paste()
				},
			},
		])
	}
}
