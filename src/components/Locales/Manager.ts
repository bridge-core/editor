import { deepMerge } from 'bridge-common-utils'
import { reactive } from 'vue'
import { settingsState } from '../Windows/Settings/SettingsState'
import enLang from '/@/locales/en.json'
import allLanguages from '/@/locales/languages.json'

const languages = Object.fromEntries(
	Object.entries(import.meta.glob('../../locales/*.json')).map(
		([key, val]) => [key.split('/').pop(), val]
	)
)

export class LocaleManager {
	protected static currentLanguage = reactive<any>(enLang)
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

	static setDefaultLanguage() {
		// Set language based on bridge. setting
		if (typeof settingsState?.general?.locale === 'string')
			this.applyLanguage(settingsState?.general?.locale)
		else {
			// Set language based on browser language
			for (const langCode of navigator.languages) {
				const lang = allLanguages.find(({ codes }) =>
					codes.includes(langCode)
				)
				if (!lang) continue

				this.applyLanguage(lang.id)
				break
			}
		}
	}

	static async applyLanguage(id: string) {
		console.log(id)
		const fetchName = allLanguages.find((l) => l.id === id)?.file
		if (!fetchName)
			throw new Error(`[Locales] Language with id "${id}" not found`)

		const language = await languages[fetchName]()
		if (!language)
			throw new Error(
				`[Locales] Language with id "${id}" not found: File "${fetchName}" does not exist`
			)

		console.log(language)
		this.currentLanguage = reactive(
			id === 'english'
				? structuredClone(enLang)
				: deepMerge(
						structuredClone(enLang),
						structuredClone({ ...language })
				  )
		)
		console.log(this.currentLanguage)
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
