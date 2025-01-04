import { Component, ref } from 'vue'
import TextTabComponent from './TextTab.vue'
import { Position, Uri, editor, editor as monaco, Range } from 'monaco-editor'
import { keyword } from 'color-convert'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { setMonarchTokensProvider } from '@/libs/monaco/Json'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { ThemeManager } from '@/libs/theme/ThemeManager'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { FileTab } from '@/components/TabSystem/FileTab'
import { Settings } from '@/libs/settings/Settings'
import { Disposable, disposeAll } from '@/libs/disposeable/Disposeable'
import { openUrl } from '@/libs/OpenUrl'

export class TextTab extends FileTab {
	public component: Component | null = TextTabComponent
	public icon = ref('loading')
	public language = ref('plaintext')
	public hasDocumentation = ref(false)

	private fileTypeIcon: string = 'data_object'
	private editor: monaco.IStandaloneCodeEditor | null = null
	private model: monaco.ITextModel | null = null

	private fileType: any | null = null

	private disposables: Disposable[] = []

	private savedViewState: editor.ICodeEditorViewState | undefined = undefined
	private initialVersionId: number = 0

	private lastEditorElement: HTMLElement | null = null

	public static canEdit(path: string): boolean {
		return true
	}

	public is(path: string) {
		return path === this.path
	}

	public static setup() {
		Settings.addSetting('bracketPairColorization', {
			default: false,
		})

		Settings.addSetting('wordWrap', {
			default: false,
		})

		Settings.addSetting('wordWrapColumns', {
			default: 120,
			async save(value) {
				const number = parseInt(value)

				if (isNaN(number)) {
					Settings.settings['wordWrapColumns'] = 120
				} else {
					Settings.settings['wordWrapColumns'] = number
				}
			},
		})
	}

	public async create() {
		if (!ProjectManager.currentProject) return
		if (!(ProjectManager.currentProject instanceof BedrockProject)) return

		const fileTypeData = ProjectManager.currentProject.fileTypeData

		this.fileType = fileTypeData.get(this.path)

		if (this.fileType !== null) {
			this.hasDocumentation.value = this.fileType.documentation !== undefined

			if (this.fileType.icon !== undefined) this.fileTypeIcon = this.fileType.icon
		}

		const fileContent = await fileSystem.readFileText(this.path)

		this.model = monaco.getModel(Uri.file(this.path))

		if (this.model === null) this.model = monaco.createModel(fileContent, this.fileType?.meta?.language, Uri.file(this.path))

		this.initialVersionId = this.model.getAlternativeVersionId()

		this.language.value = this.model.getLanguageId()

		this.disposables.push(
			this.model.onDidChangeLanguageConfiguration(() => {
				if (this.editor === undefined) return

				this.updateEditorTheme()
			})
		)

		this.disposables.push(
			this.model.onDidChangeContent(() => {
				this.modified.value = this.initialVersionId !== this.model?.getVersionId()
			})
		)

		const schemaData = ProjectManager.currentProject.schemaData
		const scriptTypeData = ProjectManager.currentProject.scriptTypeData

		await schemaData.updateSchemaForFile(this.path, this.fileType?.id, this.fileType?.schema)

		await scriptTypeData.applyTypes(this.fileType?.types ?? [])

		this.icon.value = this.fileTypeIcon

		this.disposables.push(
			Settings.updated.on((event: { id: string; value: any } | undefined) => {
				if (!event) return

				if (['wordWrap', 'wordWrapColumns', 'bracketPairColorization', 'editorFont', 'editorFontSize'].includes(event.id)) this.remountEditor()
			})
		)
	}

	public async destroy() {
		disposeAll(this.disposables)

		this.model?.dispose()
	}

	public async activate() {
		if (!ProjectManager.currentProject) return
		if (!(ProjectManager.currentProject instanceof BedrockProject)) return

		const schemaData = ProjectManager.currentProject.schemaData

		schemaData.addFileForUpdate(this.path, this.fileType?.id, this.fileType?.schema)

		await schemaData.updateSchemaForFile(this.path, this.fileType?.id, this.fileType?.schema)
	}

	public async deactivate() {
		if (!ProjectManager.currentProject) return
		if (!(ProjectManager.currentProject instanceof BedrockProject)) return

		const schemaData = ProjectManager.currentProject.schemaData

		schemaData.removeFileForUpdate(this.path)
	}

	public async mountEditor(element: HTMLElement) {
		if (!ProjectManager.currentProject) return
		if (!(ProjectManager.currentProject instanceof BedrockProject)) return

		this.updateEditorTheme()

		this.disposables.push(ThemeManager.themeChanged.on(this.updateEditorTheme.bind(this)))

		this.editor = monaco.create(element, {
			fontFamily: Settings.get('editorFont'),
			fontSize: Settings.get('editorFontSize'),
			//@ts-ignore Monaco types have not been update yet
			'bracketPairColorization.enabled': Settings.get('bracketPairColorization'),
			wordWrap: Settings.get<boolean>('wordWrap') ? 'wordWrapColumn' : 'off',
			wordWrapColumn: Settings.get<number>('wordWrapColumns'),
			automaticLayout: true,
			contextmenu: false,
		})

		this.editor.setModel(this.model)

		if (this.savedViewState) this.editor.restoreViewState(this.savedViewState)

		this.lastEditorElement = element
	}

	public unmountEditor() {
		this.savedViewState = this.editor?.saveViewState() ?? undefined

		this.editor?.dispose()
	}

	public async remountEditor() {
		if (!this.lastEditorElement) return

		await this.unmountEditor()
		await this.mountEditor(this.lastEditorElement)
	}

	public async save() {
		if (!this.model) return
		if (!this.editor) return

		this.icon.value = 'loading'

		if (Settings.get('formatOnSave')) {
			await this.format()
		}

		this.initialVersionId = this.model.getVersionId()
		this.modified.value = false

		await fileSystem.writeFile(this.path, this.model.getValue())

		this.icon.value = this.fileTypeIcon
	}

	public copy() {
		if (!this.model) return
		if (!this.editor) return

		this.editor.focus()
		this.editor.trigger('action', 'editor.action.clipboardCopyAction', undefined)
	}

	public cut() {
		if (!this.model) return
		if (!this.editor) return

		this.editor.focus()
		this.editor.trigger('action', 'editor.action.clipboardCutAction', undefined)
	}

	public paste() {
		if (!this.model) return
		if (!this.editor) return

		this.editor.focus()
		this.editor.trigger('action', 'editor.action.clipboardPasteAction', undefined)
	}

	public async format() {
		if (!this.editor) return

		const action = this.editor.getAction('editor.action.formatDocument')

		await action?.run()
	}

	public goToDefinition() {
		if (!this.editor) return

		this.editor.trigger('action', 'editor.action.revealDefinition', undefined)
	}

	public goToSymbol() {
		if (!this.editor) return

		this.editor.focus()
		this.editor.trigger('action', 'editor.action.quickOutline', undefined)
	}

	public changeAllOccurrences() {
		if (!this.editor) return

		this.editor.trigger('action', 'editor.action.rename', undefined)
	}

	public async viewDocumentation() {
		if (!this.editor) return
		if (!this.model) return

		const selection = this.editor.getSelection()

		if (!selection) return

		if (!this.fileType.documentation) return

		let word: string | undefined
		if (this.language.value === 'json') {
			word = (await this.getJsonWordAtPosition(this.model, selection.getPosition())).word
		} else {
			word = this.model.getWordAtPosition(selection.getPosition())?.word
		}

		if (!word) return

		let url = this.fileType.documentation.baseUrl
		if (word && (this.fileType.documentation.supportsQuerying ?? true)) url += `#${word}`

		openUrl(url)
	}

	private async getJsonWordAtPosition(model: editor.ITextModel, position: Position) {
		const line = model.getLineContent(position.lineNumber)

		const wordStart = this.getPreviousQuote(line, position.column)
		const wordEnd = this.getNextQuote(line, position.column)
		return {
			word: line.substring(wordStart, wordEnd),
			range: new Range(position.lineNumber, wordStart, position.lineNumber, wordEnd),
		}
	}

	private getNextQuote(line: string, startIndex: number) {
		for (let i = startIndex - 1; i < line.length; i++) {
			if (line[i] === '"') return i
		}
		return line.length
	}

	private getPreviousQuote(line: string, startIndex: number) {
		for (let i = startIndex - 2; i > 0; i--) {
			if (line[i] === '"') return i + 1
		}
		return 0
	}

	private getColor(name: string): string {
		return this.convertColor(
			//@ts-ignore  Typescript doesn't like indexing the colors for some reason
			ThemeManager.get(ThemeManager.currentTheme).colors[<any>name] ?? 'pink'
		)
	}

	private convertColor(color: string): string {
		if (!color) return color

		if (color.startsWith('#')) {
			if (color.length === 4) {
				return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
			}
			return color
		}

		return '#' + keyword.hex(color as any)
	}

	private updateEditorTheme() {
		const theme = ThemeManager.get(ThemeManager.currentTheme)

		monaco.defineTheme(`bridge`, {
			base: theme.colorScheme === 'light' ? 'vs' : 'vs-dark',
			inherit: false,
			colors: {
				'editor.background': this.getColor('background'),
				'editor.lineHighlightBackground': this.getColor('lineHighlightBackground'),
				'editorWidget.background': this.getColor('background'),
				'editorWidget.border': this.getColor('backgroundSecondary'),
				'pickerGroup.background': this.getColor('background'),
				'pickerGroup.border': this.getColor('backgroundSecondary'),
				'badge.background': this.getColor('background'),

				'input.background': this.getColor('backgroundSecondary'),
				'input.border': this.getColor('backgroundSecondary'),
				'inputOption.activeBorder': this.getColor('primary'),
				focusBorder: this.getColor('primary'),
				'list.focusBackground': this.getColor('backgroundSecondary'),
				'list.hoverBackground': this.getColor('backgroundSecondary'),
				contrastBorder: this.getColor('backgroundSecondary'),

				'peekViewTitle.background': this.getColor('background'),
				'peekView.border': this.getColor('primary'),
				'peekViewResult.background': this.getColor('backgroundSecondary'),
				'peekViewResult.selectionBackground': this.getColor('backgroundSecondary'),
				'peekViewEditor.background': this.getColor('background'),
				'peekViewEditor.matchHighlightBackground': this.getColor('backgroundSecondary'),
				...theme.monaco,
			},
			rules: [
				//@ts-ignore
				{
					background: this.getColor('background'),
					foreground: this.getColor('text'),
				},
				...Object.entries(theme.highlighter ?? {})
					.map(([token, { color, background, textDecoration, isItalic }]) => ({
						token: token,
						foreground: this.convertColor(color as string),
						background: background ? this.convertColor(background as string) : undefined,
						fontStyle: `${isItalic ? 'italic ' : ''}${textDecoration}`,
					}))
					.filter(({ foreground }) => foreground !== undefined),
			],
		})

		monaco.setTheme(`bridge`)

		let keywords: string[] = ['minecraft', 'bridge', ProjectManager.currentProject?.config?.namespace].filter((item) => item !== undefined) as string[]
		let typeIdentifiers: string[] = []
		let variables: string[] = []
		let definitions: string[] = []

		if (this.fileType && this.fileType.highlighterConfiguration) {
			keywords = [...keywords, ...(this.fileType.highlighterConfiguration.keywords ?? [])]
			typeIdentifiers = this.fileType.highlighterConfiguration.typeIdentifiers ?? []
			variables = this.fileType.highlighterConfiguration.variables ?? []
			definitions = this.fileType.highlighterConfiguration.definitions ?? []
		}

		setMonarchTokensProvider({
			defaultToken: 'identifier',

			keywords,
			atoms: ['true', 'false', 'null'],
			typeIdentifiers,
			definitions,
			variables,

			symbols: /[=><!~?:&|+\-*\/\^%]+/,
			escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
			digits: /\d+(_+\d+)*/,

			tokenizer: {
				root: [
					[/[{}\[\]]/, 'delimiter.bracket'],

					{ include: '@whitespace' },

					{ include: '@number' },

					[
						/[a-z_$][\w$]*/,
						{
							cases: {
								'@atoms': 'atom',
								'@default': 'identifier',
							},
						},
					],

					[/[:,]/, 'identifier'],

					[/"/, 'identifier', '@string'],

					[/\/\*\*(?!\/)/, 'comment.doc', '@jsdoc'],

					[/\/\*/, 'comment', '@comment'],

					[/\/\/.*$/, 'comment'],
				],

				whitespace: [[/[ \t\r\n]+/, '']],

				string: [
					[/@escapes/, 'keyword'],

					[
						/(\\"|[^\"\:])+/,
						{
							cases: {
								'@keywords': 'keyword',
								'@variables': 'variable',
								'@typeIdentifiers': 'type.identifier',
								'@definitions': 'definition',
								'@default': 'string',
							},
						},
					],

					[/(?<!\\)"/, 'identifier', '@pop'],
				],

				number: [
					[/(@digits)[eE]([\-+]?(@digits))?/, 'number.float'],

					[/(@digits)\.(@digits)([eE][\-+]?(@digits))?/, 'number.float'],

					[/(@digits)/, 'number'],
				],

				comment: [
					[/[^\/*]+/, 'comment'],

					[/\*\//, 'comment', '@pop'],

					[/[\/*]/, 'comment'],
				],

				jsdoc: [
					[/[^\/*]+/, 'comment.doc'],

					[/\*\//, 'comment.doc', '@pop'],

					[/[\/*]/, 'comment.doc'],
				],
			},
		})
	}
}
