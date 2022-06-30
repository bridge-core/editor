import { ref } from 'vue'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'

export function translate(vuetify: any, translationKey?: string) {
	const orginalKey = translationKey
	if (orginalKey?.startsWith('[') && orginalKey.endsWith(']'))
		return orginalKey.slice(1, -1)

	if (!translationKey?.startsWith('$vuetify.'))
		translationKey = `$vuetify.${translationKey}`

	let translated: string
	try {
		translated = vuetify.locale.getScope().t(translationKey)
	} catch (err) {
		return orginalKey ?? 'Unknown'
	}

	if (translated === translationKey) return orginalKey ?? 'Unknown'
	return translated
}

export class Locales {
	public readonly locale = ref('en')
	constructor(protected vuetify: any) {}

	translate(translationKey?: string) {
		return translate(this.vuetify, translationKey)
	}

	addLanguage(key: string, obj: unknown, force = false) {
		const lang = this.vuetify.lang
		if (key in lang.locales && !force)
			throw new Error(`Language key "${key}" already exists!`)

		lang.locales[key] = obj

		return {
			dispose: () => {
				if (lang.current === key) lang.current = lang.defaultLocale
				lang.locales[key] = undefined
			},
		}
	}

	selectLanguage(key: string) {
		this.locale.value = key
	}

	getLanguages() {
		const locales = this.vuetify.lang.locales
		return Object.entries(locales)
			.filter(([_, locale]) => (locale as any).languageName !== undefined)
			.map(([key, locale]) => [key, (locale as any).languageName])
	}

	getCurrentLanguage() {
		return this.vuetify.lang.current
	}

	setDefaultLanguage() {
		// Set language
		if (typeof settingsState?.general?.locale === 'string')
			this.selectLanguage(settingsState?.general?.locale)
		else {
			// Set language based off of browser language
			for (const [lang] of this.getLanguages()) {
				if (navigator.language.includes(lang)) {
					this.selectLanguage(lang)
				}
			}
		}
	}
}
