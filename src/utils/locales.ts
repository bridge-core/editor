import Vue from 'vue'

export class Locales {
	constructor(protected vuetify: any) {}

	translate(translationKey?: string) {
		const orginalKey = translationKey
		if (!translationKey?.startsWith('$vuetify.'))
			translationKey = `$vuetify.${translationKey}`

		let translated: string
		try {
			translated = this.vuetify.lang.t(translationKey)
		} catch {
			return orginalKey ?? 'Unknown'
		}

		if (translated === translationKey) return orginalKey
		return translated
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
