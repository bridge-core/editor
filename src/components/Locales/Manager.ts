import { deepMerge } from 'bridge-common-utils'
import { get } from 'idb-keyval'
import enLang from '/@/locales/en.json'
import allLanguages from '/@/locales/languages.json'

const languages = Object.fromEntries(
	Object.entries(
		import.meta.glob([
			'../../locales/*.json',
			'!../../locales/en.json',
			'!../../locales/languages.json',
		])
	).map(([key, val]) => [key.split('/').pop(), val])
)

export class LocaleManager {
	protected static currentLanguage: any = enLang
	protected static currentLanuageId = 'english'

	static getAvailableLanguages() {
		return allLanguages
			.sort((a, b) => a.name.localeCompare(b.name))
			.map((l) => ({
				text: l.name,
				value: l.id,
			}))
	}
	static getCurrentLanguageId() {
		return this.currentLanuageId
	}

	static async setDefaultLanguage() {
		const language = await get<string>('language')

		// Set language based on bridge. setting
		if (language) {
			await this.applyLanguage(language)
		} else {
			// Set language based on browser language
			for (const langCode of navigator.languages) {
				const lang = allLanguages.find(({ codes }) =>
					codes.includes(langCode)
				)
				if (!lang) continue

				await this.applyLanguage(lang.id)
				break
			}
		}
	}

	static async applyLanguage(id: string) {
		if (id === this.currentLanuageId) return

		if (id === 'english') {
			this.currentLanguage = clone(enLang)
			this.currentLanuageId = id
			return
		}

		const fetchName = allLanguages.find((l) => l.id === id)?.file
		if (!fetchName)
			throw new Error(`[Locales] Language with id "${id}" not found`)

		const language = (await languages[fetchName]()).default
		if (!language)
			throw new Error(
				`[Locales] Language with id "${id}" not found: File "${fetchName}" does not exist`
			)

		this.currentLanguage = deepMerge(clone(enLang), clone({ ...language }))

		this.currentLanuageId = id
	}

	static translate(key?: string) {
		if (!key) return ''

		if (key.startsWith('[') && key.endsWith(']')) {
			return key.slice(1, -1)
		}

		const parts = key.split('.')

		let current = this.currentLanguage
		for (const part of parts) {
			current = current[part]

			if (!current) {
				console.warn(`[Locales] Translation key "${key}" not found`)
				return key
			}
		}

		if (typeof current !== 'string') {
			console.warn(`[Locales] Translation key "${key}" not found`)
			return key
		}

		return current
	}
}

export function translate(key?: string) {
	return LocaleManager.translate(key)
}

export function translateWithInsertions(key?: string, insert?: string[]) {
	let translation = LocaleManager.translate(key)
	if (!insert) return translation

	for (let i = 0; i <= insert.length; i++) {
		translation = translation?.replace(`{{$${i + 1}}}`, insert[i])
	}

	return translation
}

function clone(obj: any) {
	if (typeof window.structuredClone === 'function')
		return window.structuredClone(obj)

	return JSON.parse(JSON.stringify(obj))
}
