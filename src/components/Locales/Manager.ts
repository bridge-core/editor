import { deepMerge } from 'bridge-common-utils'
import { get } from 'idb-keyval'
import { reactive } from 'vue'
import { settingsState } from '../Windows/Settings/SettingsState'
import enLangRaw from '/@/locales/en.json?raw'
import allLanguages from '/@/locales/languages.json'

const languages = Object.fromEntries(
	Object.entries(
		import.meta.glob(
			[
				'../../locales/*.json',
				'!../../locales/en.json',
				'!../../locales/languages.json',
			],
			{ as: 'raw' }
		)
	).map(([key, val]) => [key.split('/').pop(), val])
)
const enLang = JSON.parse(enLangRaw)

export class LocaleManager {
	protected static currentLanguage: any = enLang
	protected static currentLanuageId = 'english'

	static getAvailableLanguages() {
		return allLanguages.map((l) => ({
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
			this.currentLanguage = reactive(structuredClone(enLang))
			this.currentLanuageId = id
			return
		}

		const fetchName = allLanguages.find((l) => l.id === id)?.file
		if (!fetchName)
			throw new Error(`[Locales] Language with id "${id}" not found`)

		const language = JSON.parse(await languages[fetchName]())
		if (!language)
			throw new Error(
				`[Locales] Language with id "${id}" not found: File "${fetchName}" does not exist`
			)

		this.currentLanguage = deepMerge(
			structuredClone(enLang),
			structuredClone({ ...language })
		)

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
