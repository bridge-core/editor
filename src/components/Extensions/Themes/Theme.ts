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
		const theme = vuetify.theme.getTheme(this.colorScheme)
		vuetify.theme.setTheme(this.colorScheme, {
			...theme,
			colors: Object.fromEntries(this.colorMap.entries()),
		})
		// TODO(Vue3): Implement v-theme-provider and change theme here

		themeManager.setThemeColor(this.colorMap.get('toolbar') ?? 'red')
		this.monacoSubTheme.apply()
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
