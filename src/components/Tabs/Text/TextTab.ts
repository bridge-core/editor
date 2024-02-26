import { Component, ref } from 'vue'
import { Tab } from '@/components/TabSystem/Tab'
import TextTabComponent from '@/components/Tabs/Text/TextTab.vue'
import { Uri, editor as monaco } from 'monaco-editor'
import { keyword } from 'color-convert'
import { fileSystem, settings } from '@/App'
import { setMonarchTokensProvider } from '@/libs/monaco/Json'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { ThemeManager } from '@/libs/theme/ThemeManager'
import { ProjectManager } from '@/libs/project/ProjectManager'

export class TextTab extends Tab {
	public component: Component | null = TextTabComponent
	public icon = ref('loading')

	private fileTypeIcon: string = 'data_object'
	private editor: monaco.IStandaloneCodeEditor | null = null
	private model: monaco.ITextModel | null = null

	private fileType: any | null = null

	public static canEdit(path: string): boolean {
		return true
	}

	public is(path: string) {
		return path === this.path
	}

	public async setup() {
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
			'bracketPairColorization.enabled': settings.get('bracketPairColorization'),
			automaticLayout: true,
			contextmenu: false,
		})

		const fileContent = await fileSystem.readFileText(this.path)

		this.model = monaco.getModel(Uri.file(this.path))

		if (this.model === null) {
			this.model = monaco.createModel(
				fileContent,
				this.fileType?.meta.language ?? 'plaintext',
				Uri.file(this.path)
			)
		}

		this.editor.setModel(this.model)

		const schemaData = ProjectManager.currentProject.schemaData
		const scriptTypeData = ProjectManager.currentProject.scriptTypeData

		if (this.fileType && this.fileType.schema) await schemaData.applySchemaForFile(this.path, this.fileType.schema)
		if (this.fileType && this.fileType.types) await scriptTypeData.applyTypesForFile(this.path, this.fileType.types)

		this.updateEditorTheme()

		this.icon.value = this.fileTypeIcon
	}

	public unmountEditor() {
		this.model?.dispose()
		this.editor?.dispose()

		ThemeManager.eventSystem.off('themeChanged', this.updateEditorTheme)
	}

	public async save() {
		if (!this.model) return
		if (!this.editor) return

		this.icon.value = 'loading'

		this.editor.trigger('contextmenu', 'editor.action.formatDocument', null)

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
				'editorWidget.border': this.getColor('sidebarNavigation'),
				'pickerGroup.background': this.getColor('background'),
				'pickerGroup.border': this.getColor('sidebarNavigation'),
				'badge.background': this.getColor('background'),

				'input.background': this.getColor('sidebarNavigation'),
				'input.border': this.getColor('menu'),
				'inputOption.activeBorder': this.getColor('primary'),
				focusBorder: this.getColor('primary'),
				'list.focusBackground': this.getColor('menu'),
				'list.hoverBackground': this.getColor('sidebarNavigation'),
				contrastBorder: this.getColor('sidebarNavigation'),

				'peekViewTitle.background': this.getColor('background'),
				'peekView.border': this.getColor('primary'),
				'peekViewResult.background': this.getColor('sidebarNavigation'),
				'peekViewResult.selectionBackground': this.getColor('menu'),
				'peekViewEditor.background': this.getColor('background'),
				'peekViewEditor.matchHighlightBackground': this.getColor('menu'),
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
