import Vue from 'vue'

export function translate(vuetify: any, translationKey?: string) {
	const orginalKey = translationKey
	if (orginalKey?.startsWith('[') && orginalKey.endsWith(']'))
		return orginalKey.slice(1, -1)

	if (!translationKey?.startsWith('$vuetify.'))
		translationKey = `$vuetify.${translationKey}`

	let translated: string
	try {
		translated = vuetify.lang.t(translationKey)
	} catch {
		return orginalKey ?? 'Unknown'
	}

	if (translated === translationKey) return orginalKey ?? 'Unknown'
	return translated
}

export class Locales {
	constructor(protected vuetify: any) {}

	translate(translationKey?: string) {
		return translate(this.vuetify, translationKey)
	}

	addLanguage(key: string, obj: unknown, force = false) {
		const lang = this.vuetify.lang
		if (key in lang.locales && !force)
			throw new Error(`Language key "${key}" already exists!`)
		Vue.set(lang.locales, key, obj)

		return {
			dispose: () => {
				if (lang.current === key) lang.current = lang.defaultLocale
				Vue.delete(lang.locales, key)
			},
		}
	}

	selectLanguage(key: string) {
		const lang = this.vuetify.lang
		if (!(key in lang.locales))
			throw new Error(`Undefined language: "${key}"`)
		lang.current = key
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
}
