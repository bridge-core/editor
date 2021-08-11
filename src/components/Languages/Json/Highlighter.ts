import json5 from 'json5'
import { languages } from 'monaco-editor'
import { FileType } from '/@/components/Data/FileType'
import { TextTab } from '/@/components/Editors/Text/TextTab'
import { CombinedFileSystem } from '/@/components/FileSystem/CombinedFs'
import { ProjectConfig } from '/@/components/Projects/ProjectConfig'
import { App } from '/@/App'
import { IDisposable } from '/@/types/disposable'

export class ConfiguredJsonHighlighter {
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

	constructor() {
		App.getApp().then(async (app) => {
			await app.projectManager.projectReady.fired

			app.projectManager.onActiveProject((project) => {
				this.updateKeywords(project.config)
				project.fileSave.on('config.json', () =>
					this.updateKeywords(project.config)
				)
			})
		})

		App.eventSystem.on('currentTabSwitched', async () => {
			const app = await App.getApp()
			await app.projectManager.projectReady.fired

			const tab = app.project.tabSystem?.selectedTab
			if (!(tab instanceof TextTab)) return

			const { id, highlighterConfiguration = {} } =
				FileType.get(tab.getProjectPath()) ?? {}

			// We have already loaded the needed file type
			if (!id || id === this.loadedFileType) return

			this.dynamicKeywords = highlighterConfiguration.keywords ?? []
			this.typeIdentifiers =
				highlighterConfiguration.typeIdentifiers ?? []
			this.variables = highlighterConfiguration.variables ?? []
			this.definitions = highlighterConfiguration.definitions ?? []

			this.updateHighlighter()
			this.loadedFileType = id
		})
	}
	async loadFromConfig(fs: CombinedFileSystem, val?: string[]) {
		if (val === undefined) return []
		if (Array.isArray(val)) return val
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
					[/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
					[/'([^'\\]|\\.)*$/, 'string.invalid'], // non-teminated string
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
	}
}
