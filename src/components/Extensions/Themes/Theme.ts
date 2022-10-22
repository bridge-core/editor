import Vue from 'vue'
import { TColorName, IThemeDefinition, ThemeManager } from './ThemeManager'
import { MonacoSubTheme } from './MonacoSubTheme'

export class Theme {
	public readonly id: string
	public readonly colorScheme: 'dark' | 'light'
	public readonly name: string

	protected colorMap: Map<TColorName, string>
	protected highlighterDef: IThemeDefinition['highlighter']
	protected monacoDef: IThemeDefinition['monaco']

	protected monacoSubTheme: MonacoSubTheme

	constructor(
		protected themeDefinition: IThemeDefinition,
		public readonly isGlobal: boolean
	) {
		this.id = themeDefinition.id
		this.name = themeDefinition.name
		this.colorScheme = themeDefinition.colorScheme ?? 'dark'

		this.colorMap = new Map(
			<[TColorName, string][]>Object.entries(themeDefinition.colors)
		)
		this.monacoDef = themeDefinition.monaco
		this.highlighterDef = themeDefinition.highlighter

		this.monacoSubTheme = new MonacoSubTheme(this)
	}

	apply(themeManager: ThemeManager, vuetify: any) {
		Vue.set(
			vuetify.theme.themes,
			this.colorScheme,
			Object.fromEntries(this.colorMap.entries())
		)
		Vue.set(vuetify.theme, 'dark', this.colorScheme === 'dark')

		themeManager.setThemeColor(this.colorMap.get('toolbar') ?? 'red')
		this.applyMonacoTheme()
	}
	async applyMonacoTheme() {
		await this.monacoSubTheme.apply()
	}

	getColor(colorName: TColorName) {
		return this.colorMap.get(colorName) ?? 'red'
	}
	getHighlighterInfo(colorName: string) {
		return this.highlighterDef?.[colorName]
	}
	getMonacoDefinition() {
		return this.monacoDef ?? {}
	}
	getHighlighterDefinition() {
		return this.highlighterDef ?? {}
	}
	getThemeDefinition() {
		return this.themeDefinition
	}
}
