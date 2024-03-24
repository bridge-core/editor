import { Component, ref } from 'vue'
import TextTabComponent from '@/components/Tabs/Text/TextTab.vue'
import { Position, Uri, editor, editor as monaco, Range, IDisposable } from 'monaco-editor'
import { keyword } from 'color-convert'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { setMonarchTokensProvider } from '@/libs/monaco/Json'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { ThemeManager } from '@/libs/theme/ThemeManager'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { FileTab } from '@/components/TabSystem/FileTab'
import { Settings } from '@/libs/settings/Settings'

export class TextTab extends FileTab {
	public component: Component | null = TextTabComponent
	public icon = ref('loading')
	public language = ref('plaintext')

	private fileTypeIcon: string = 'data_object'
	private editor: monaco.IStandaloneCodeEditor | null = null
	private model: monaco.ITextModel | null = null

	private fileType: any | null = null

	private disposables: IDisposable[] = []

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
	}

	public async setupTab() {
		if (!ProjectManager.currentProject) return
		if (!(ProjectManager.currentProject instanceof BedrockProject)) return

		const fileTypeData = ProjectManager.currentProject.fileTypeData

		this.fileType = fileTypeData.get(this.path)

		if (this.fileType === null) return

		if (this.fileType.icon === undefined) return

		this.fileTypeIcon = this.fileType.icon
	}

	public async mountEditor(element: HTMLElement) {
		if (!ProjectManager.currentProject) return
		if (!(ProjectManager.currentProject instanceof BedrockProject)) return

		this.updateEditorTheme()

		ThemeManager.eventSystem.on('themeChanged', this.updateEditorTheme.bind(this))

		this.editor = monaco.create(element, {
			fontFamily: 'Consolas',
			//@ts-ignore Monaco types have not been update yet
			'bracketPairColorization.enabled': Settings.get('bracketPairColorization'),
			automaticLayout: true,
			contextmenu: false,
		})

		const fileContent = await fileSystem.readFileText(this.path)

		this.model = monaco.getModel(Uri.file(this.path))

		this.language.value = this.fileType?.meta.language ?? 'plaintext'

		if (this.model === null) {
			this.model = monaco.createModel(
				fileContent,
				this.fileType?.meta.language ?? 'plaintext',
				Uri.file(this.path)
			)
		}

		this.editor.setModel(this.model)

		this.disposables.push(
			this.model.onDidChangeLanguageConfiguration(() => {
				this.updateEditorTheme()
			})
		)

		const schemaData = ProjectManager.currentProject.schemaData
		const scriptTypeData = ProjectManager.currentProject.scriptTypeData

		if (this.fileType && this.fileType.schema) await schemaData.applySchemaForFile(this.path, this.fileType.schema)
		if (this.fileType && this.fileType.types) await scriptTypeData.applyTypesForFile(this.path, this.fileType.types)

		this.icon.value = this.fileTypeIcon
	}

	public unmountEditor() {
		for (const disposable of this.disposables) {
			disposable.dispose()
		}

		this.model?.dispose()
		this.editor?.dispose()

		ThemeManager.eventSystem.off('themeChanged', this.updateEditorTheme)
	}

	public async save() {
		if (!this.model) return
		if (!this.editor) return

		this.icon.value = 'loading'

		this.format()

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

	public format() {
		if (!this.editor) return

		this.editor.trigger('action', 'editor.action.formatDocument', undefined)
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

		if (!this.fileType.documentation) {
			alert('No documentation found!')

			return
		}

		let word: string | undefined
		if (this.language.value === 'json') {
			word = (await this.getJsonWordAtPosition(this.model, selection.getPosition())).word
		} else {
			word = this.model.getWordAtPosition(selection.getPosition())?.word
		}

		if (!word) return

		let url = this.fileType.documentation.baseUrl
		if (word && (this.fileType.documentation.supportsQuerying ?? true)) url += `#${word}`

		window.open(url)
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

		let typeIdentifiers: string[] = []
		let variables: string[] = []

		if (this.fileType && this.fileType.highlighterConfiguration) {
			typeIdentifiers = this.fileType.highlighterConfiguration.typeIdentifiers ?? []
			variables = this.fileType.highlighterConfiguration.variables ?? []
		}

		setMonarchTokensProvider({
			defaultToken: 'identifier',

			keywords: ['format_version'],
			atoms: ['true', 'false', 'null'],
			typeIdentifiers,
			definitions: [],
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
								'@atoms': 'type',
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
						/([^(\\")])+/,
						{
							cases: {
								'@keywords': 'keyword',
								'@variables': 'variable',
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
