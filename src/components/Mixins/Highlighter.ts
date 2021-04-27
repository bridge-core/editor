// @ts-nocheck
import { App } from '/@/App'

const toPropertyName = (name: string) => `${name}Def`
export const HighlighterMixin = (defNames: string[]) => ({
	data: () =>
		Object.fromEntries(defNames.map((name) => [toPropertyName(name), {}])),
	mounted() {
		App.instance.themeManager.on(this.onThemeChanged)
		this.onThemeChanged()
	},
	destroyed() {
		App.instance.themeManager.off(this.onThemeChanged)
	},
	methods: {
		onThemeChanged() {
			defNames.forEach((name) => {
				this[
					toPropertyName(name)
				] = App.instance.themeManager.getHighlighterInfo(name)
			})
		},
	},
})
