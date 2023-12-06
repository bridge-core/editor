import { Component, markRaw, ref } from 'vue'
import { Tab } from '@/components/TabSystem/Tab'
import TextTabComponent from '@/components/Tabs/Text/TextTab.vue'
import { Uri, editor as monaco } from 'monaco-editor'
import { keyword } from 'color-convert'
import { fileSystem, fileTypeData, themeManager } from '@/App'
import { basename } from '@/libs/path'

export class TextTab extends Tab {
	public component: Component | null = markRaw(TextTabComponent)
	public icon = ref('data_object')

	private editor: monaco.IStandaloneCodeEditor | null = null
	private model: monaco.ITextModel | null = null

	constructor(public path: string) {
		super()

		this.name.value = basename(path)
	}

	public async activate() {
		const fileType = await fileTypeData.get(this.path)

		if (fileType === null) return

		if (fileType.icon === undefined) return

		this.icon.value = fileType.icon
	}

	public async deactivate() {
		if (this.editor === null) return

		this.editor.dispose()

		if (this.model === null) return

		this.model.dispose()
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

	public async addEditor(element: HTMLDivElement) {
		this.editor = markRaw(
			monaco.create(element, {
				fontFamily: 'Consolas',
			})
		)

		this.updateEditorTheme()

		const fileContent = await fileSystem.readFileText(this.path)

		this.model = markRaw(
			monaco.createModel(fileContent, 'json', Uri.file(this.path))
		)

		this.editor.setModel(this.model)
	}

	private updateEditorTheme() {
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
	}
}
