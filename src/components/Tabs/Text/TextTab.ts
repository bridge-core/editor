import { Component, ref } from 'vue'
import { Tab } from '@/components/TabSystem/Tab'
import TextTabComponent from '@/components/Tabs/Text/TextTab.vue'
import { Uri, editor as monaco } from 'monaco-editor'
import { keyword } from 'color-convert'
import { fileSystem, projectManager, settings, themeManager } from '@/App'
import { basename } from '@/libs/path'
import { setMonarchTokensProvider } from '@/libs/monaco/Json'
import { BedrockProject } from '@/libs/project/BedrockProject'

export class TextTab extends Tab {
	public component: Component | null = TextTabComponent
	public icon = ref('data_object')

	private editor: monaco.IStandaloneCodeEditor | null = null
	private model: monaco.ITextModel | null = null

	private fileType: any | null = null

	constructor(public path: string) {
		super()

		this.name.value = basename(path)
	}

	public async setup() {
		if (!projectManager.currentProject) return
		if (!(projectManager.currentProject instanceof BedrockProject)) return

		const fileTypeData = projectManager.currentProject.fileTypeData

		this.fileType = await fileTypeData.get(this.path)

		if (this.fileType === null) return

		if (this.fileType.icon === undefined) return

		this.icon.value = this.fileType.icon
	}

	public async mountEditor(element: HTMLElement) {
		if (!projectManager.currentProject) return
		if (!(projectManager.currentProject instanceof BedrockProject)) return

		await this.updateEditorTheme()

		const schemaData = projectManager.currentProject.schemaData

		this.editor = monaco.create(element, {
			fontFamily: 'Consolas',
			//@ts-ignore Monaco types have not been update yet
			'bracketPairColorization.enabled': settings.get(
				'bracketPairColorization'
			),
		})

		const fileContent = await fileSystem.readFileText(this.path)

		this.model = monaco.createModel(
			fileContent,
			'json',
			Uri.file(this.path)
		)

		this.editor.setModel(this.model)

		if (!this.fileType) return

		schemaData.applySchema(this.path, this.fileType.schema)

		window.addEventListener('keydown', (event) => {
			if (event.ctrlKey && event.key === 's') {
				event.preventDefault()

				this.save()
			}
		})
	}

	public unmountEditor() {
		if (!projectManager.currentProject) return
		if (!(projectManager.currentProject instanceof BedrockProject)) return

		const schemaData = projectManager.currentProject.schemaData

		schemaData.releaseSchema()

		this.model?.dispose()
		this.editor?.dispose()
	}

	private async save() {
		if (!this.model) return

		this.editor?.trigger(
			'contextmenu',
			'editor.action.formatDocument',
			null
		)

		let disposableCallback: any = null
		await new Promise<void>((resolve) => {
			if (!this.model) return

			disposableCallback = this.model.onDidChangeContent(() => {
				resolve()
			})
		})

		disposableCallback?.dispose()

		await fileSystem.writeFile(this.path, this.model.getValue())
	}

	private getColor(name: string): string {
		return this.convertColor(
			//@ts-ignore  Typescript doesn't like indexing the colors for some reason
			themeManager.currentTheme.colors[<any>name] ?? 'red'
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

		return keyword.hex(color as any)
	}

	private async updateEditorTheme() {
		const theme = themeManager.currentTheme

		monaco.defineTheme(`bridge`, {
			base: theme.colorScheme === 'light' ? 'vs' : 'vs-dark',
			inherit: false,
			colors: {
				'editor.background': this.convertColor(
					this.getColor('background')
				),
				'editor.lineHighlightBackground': this.convertColor(
					this.getColor('lineHighlightBackground')
				),
				'editorWidget.background': this.convertColor(
					this.getColor('background')
				),
				'editorWidget.border': this.convertColor(
					this.getColor('sidebarNavigation')
				),
				'pickerGroup.background': this.convertColor(
					this.getColor('background')
				),
				'pickerGroup.border': this.convertColor(
					this.getColor('sidebarNavigation')
				),
				'badge.background': this.convertColor(
					this.getColor('background')
				),

				'input.background': this.convertColor(
					this.getColor('sidebarNavigation')
				),
				'input.border': this.convertColor(this.getColor('menu')),
				'inputOption.activeBorder': this.convertColor(
					this.getColor('primary')
				),
				focusBorder: this.convertColor(this.getColor('primary')),
				'list.focusBackground': this.convertColor(
					this.getColor('menu')
				),
				'list.hoverBackground': this.convertColor(
					this.getColor('sidebarNavigation')
				),
				contrastBorder: this.convertColor(
					this.getColor('sidebarNavigation')
				),

				'peekViewTitle.background': this.convertColor(
					this.getColor('background')
				),
				'peekView.border': this.convertColor(this.getColor('primary')),
				'peekViewResult.background': this.convertColor(
					this.getColor('sidebarNavigation')
				),
				'peekViewResult.selectionBackground': this.convertColor(
					this.getColor('menu')
				),
				'peekViewEditor.background': this.convertColor(
					this.getColor('background')
				),
				'peekViewEditor.matchHighlightBackground': this.convertColor(
					this.getColor('menu')
				),
				...theme.monaco,
			},
			rules: [
				//@ts-ignore
				{
					background: this.getColor('background'),
					foreground: this.getColor('text'),
				},
				...Object.entries(theme.highlighter ?? {})
					.map(
						([
							token,
							{ color, background, textDecoration, isItalic },
						]) => ({
							token: token,
							foreground: this.convertColor(color as string),
							background: background
								? this.convertColor(background as string)
								: undefined,
							fontStyle: `${
								isItalic ? 'italic ' : ''
							}${textDecoration}`,
						})
					)
					.filter(({ foreground }) => foreground !== undefined),
			],
		})

		monaco.setTheme(`bridge`)

		let typeIdentifiers: string[] = []
		let variables: string[] = []

		if (this.fileType && this.fileType.highlighterConfiguration) {
			typeIdentifiers =
				this.fileType.highlighterConfiguration.typeIdentifiers ?? []
			variables = this.fileType.highlighterConfiguration.variables ?? []
		}

		await setMonarchTokensProvider({
			defaultToken: 'identifier',

			keywords: ['format_version'],
			atoms: ['true', 'false', 'null'],
			typeIdentifiers,
			definitions: [],
			variables,

			symbols: /[=><!~?:&|+\-*\/\^%]+/,
			escapes:
				/\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
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

					[
						/(@digits)\.(@digits)([eE][\-+]?(@digits))?/,
						'number.float',
					],

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
