import { languages } from 'monaco-editor'
import { FileType } from '/@/components/Data/FileType'
import { TextTab } from '/@/components/Editors/Text/TextTab'
import { ProjectConfig } from '/@/components/Projects/ProjectConfig'
import { App } from '/@/App'
import { IDisposable } from '/@/types/disposable'
import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'
import { TreeTab } from '/@/components/Editors/TreeEditor/Tab'
import type { Tab } from '/@/components/TabSystem/CommonTab'

export interface IKnownWords {
	keywords: string[]
	typeIdentifiers: string[]
	variables: string[]
	definitions: string[]
}

export class ConfiguredJsonHighlighter extends EventDispatcher<IKnownWords> {
	protected currentLanguage?: IDisposable
	protected loadedFileType?: string
	protected baseKeywords: string[] = ['minecraft']
	protected dynamicKeywords: string[] = []
	protected typeIdentifiers: string[] = []
	protected variables: string[] = []
	protected definitions: string[] = []

	get keywords() {
		return this.baseKeywords.concat(this.dynamicKeywords)
	}
	get knownWords() {
		return {
			keywords: this.keywords,
			typeIdentifiers: this.typeIdentifiers,
			variables: this.variables,
			definitions: this.definitions,
		}
	}

	constructor() {
		super()

		App.getApp().then(async (app) => {
			await app.projectManager.projectReady.fired

			app.projectManager.onActiveProject((project) => {
				this.updateKeywords(project.config)
				project.fileSave.on('config.json', () =>
					this.updateKeywords(project.config)
				)
			})
		})

		App.eventSystem.on('currentTabSwitched', (tab: Tab) =>
			this.loadWords(tab)
		)
		this.loadWords()
	}

	async updateKeywords(projectConfig: ProjectConfig) {
		await projectConfig.refreshConfig()

		this.baseKeywords = <string[]>[
			...new Set(
				['minecraft', 'bridge', projectConfig.get().namespace].filter(
					(k) => k !== undefined
				)
			),
		]

		this.updateHighlighter()
	}

	async loadWords(tabArg?: Tab) {
		const app = await App.getApp()
		await app.projectManager.projectReady.fired
		await FileType.ready.fired

		const tab = tabArg ?? app.project.tabSystem?.selectedTab
		if (!(tab instanceof TextTab) && !(tab instanceof TreeTab)) return

		const { id, highlighterConfiguration = {} } =
			FileType.get(tab.getProjectPath()) ?? {}

		// We have already loaded the needed file type
		if (!id) return this.resetWords(tab)
		if (id === this.loadedFileType) return

		this.dynamicKeywords = highlighterConfiguration.keywords ?? []
		this.typeIdentifiers = highlighterConfiguration.typeIdentifiers ?? []
		this.variables = highlighterConfiguration.variables ?? []
		this.definitions = highlighterConfiguration.definitions ?? []

		if (tab instanceof TextTab) this.updateHighlighter()
		else if (tab instanceof TreeTab) this.dispatch(this.knownWords)
		this.loadedFileType = id
	}
	resetWords(tab: TreeTab | TextTab) {
		this.dynamicKeywords = []
		this.typeIdentifiers = []
		this.variables = []
		this.definitions = []

		if (tab instanceof TextTab) this.updateHighlighter()
		else if (tab instanceof TreeTab) this.dispatch(this.knownWords)
		this.loadedFileType = 'unknown'
	}

	updateHighlighter() {
		const newLanguage = languages.setMonarchTokensProvider('json', <any>{
			// Set defaultToken to invalid to see what you do not tokenize yet
			defaultToken: 'invalid',
			tokenPostfix: '.json',

			atoms: ['false', 'true', 'class', 'null'],
			keywords: this.keywords,
			typeIdentifiers: this.typeIdentifiers,
			variables: this.variables,
			definitions: this.definitions,

			// we include these common regular expressions
			symbols: /[=><!~?:&|+\-*\/\^%]+/,
			escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
			digits: /\d+(_+\d+)*/,

			// The main tokenizer for our languages
			tokenizer: {
				root: [[/[{}]/, 'delimiter.bracket'], { include: 'common' }],

				common: [
					// identifiers and atoms
					[
						/[a-z_$][\w$]*/,
						{
							cases: {
								'@atoms': 'atom',
								'@default': 'identifier',
							},
						},
					],

					// whitespace
					{ include: '@whitespace' },

					// numbers
					[/(@digits)[eE]([\-+]?(@digits))?/, 'number.float'],
					[
						/(@digits)\.(@digits)([eE][\-+]?(@digits))?/,
						'number.float',
					],
					[/(@digits)/, 'number'],

					// delimiter: after number because of .\d floats
					[/[:,]/, 'delimiter'],

					// strings
					[/"([^"\\]|\\.)*$/, 'string.invalid'], // non-terminated string
					[/'([^'\\]|\\.)*$/, 'string.invalid'], // non-terminated string
					[
						/"\//,
						{
							token: 'identifier',
							next: '@embeddedCommand',
							nextEmbedded: 'mcfunction',
						},
					],
					[/"/, 'identifier', '@string'],
				],

				embeddedCommand: [
					[/@escapes/, 'string.escape'],
					[
						/"/,
						{
							token: 'identifier',
							next: '@pop',
							nextEmbedded: '@pop',
						},
					],
				],

				whitespace: [
					[/[ \t\r\n]+/, ''],
					[/\/\*\*(?!\/)/, 'comment.doc', '@jsdoc'],
					[/\/\*/, 'comment', '@comment'],
					[/\/\/.*$/, 'comment'],
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

				string: [
					[
						/[^\"\:]+/,
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
					[/@escapes/, 'string.escape'],
					[/\\./, 'string.escape.invalid'],
					[/"/, 'identifier', '@pop'],
				],

				bracketCounting: [
					[/\{/, 'delimiter.bracket', '@bracketCounting'],
					[/\}/, 'delimiter.bracket', '@pop'],
					{ include: 'common' },
				],
			},
		})

		this.currentLanguage?.dispose()
		this.currentLanguage = newLanguage
		this.dispatch(this.knownWords)
	}
}
