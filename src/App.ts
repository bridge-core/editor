import { Toolbar } from '@/components/Toolbar/Toolbar'
import { ThemeManager } from '@/libs/theme/ThemeManager'
import { setupLanguageWorkers } from '@/libs/monaco/Monaco'
import { LocaleManager } from '@/libs/locales/Locales'

export const toolbar = new Toolbar()
export const themeManager = new ThemeManager()

export function setup() {
	setupLanguageWorkers()

	LocaleManager.applyDefaultLanguage()
}
