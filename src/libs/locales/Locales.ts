import { deepMerge } from 'bridge-common-utils'
import { get } from 'idb-keyval'
import enLang from '@/locales/en.json'
import allLanguages from '@/locales/languages.json'
import { Ref, onMounted, onUnmounted, ref } from 'vue'
import { Settings } from '@/libs/settings/Settings'
import { Event } from '@/libs/event/Event'
import { Disposable } from '@/libs/disposeable/Disposeable'
import { createReactable } from '@/libs/event/React'

// loads all languages, exclude the language file and en file since en is a special case
// en is a special case since it is the default and other languages override it
const languages = Object.fromEntries(
	Object.entries(import.meta.glob(['../../locales/*.json', '!../../locales/languages.json'])).map(([key, val]) => [
		key.split('/').pop(),
		val,
	])
)

export class LocaleManager {
	public static languageChanged: Event<string> = new Event()

	protected static currentLanguage: any = enLang
	protected static currentLanuageId = 'english'

	public static setup() {
		Settings.addSetting('language', {
			default: 'English',
		})

		Settings.updated.on((event) => {
			const { id, value } = event as { id: string; value: string }

			if (id !== 'language') return

			LocaleManager.applyLanguage(
				LocaleManager.getAvailableLanguages().find((language) => language.text === value)?.value ||
					LocaleManager.getCurrentLanguageId()
			)
		})
	}

	public static getAvailableLanguages() {
		return allLanguages
			.sort((a, b) => a.name.localeCompare(b.name))
			.map((l) => ({
				text: l.name,
				value: l.id,
			}))
	}

	public static getCurrentLanguageId() {
		return this.currentLanuageId
	}

	public static async applyDefaultLanguage() {
		const language = await get<string>('language')

		// Set language based on bridge. setting
		if (language) {
			await this.applyLanguage(language)
		} else {
			// Set language based on browser language
			for (const langCode of navigator.languages) {
				const lang = allLanguages.find(({ codes }) => codes.includes(langCode))
				if (!lang) continue

				await this.applyLanguage(lang.id)
				break
			}
		}
	}

	public static async applyLanguage(id: string) {
		if (id === this.currentLanuageId) return

		if (id === 'english') {
			this.currentLanguage = clone(enLang)
			this.currentLanuageId = id

			this.languageChanged.dispatch(id)
			return
		}

		const fetchName = allLanguages.find((l) => l.id === id)?.file
		if (!fetchName) throw new Error(`[Locales] Language with id "${id}" not found`)

		const language = (await languages[fetchName]()).default
		if (!language) throw new Error(`[Locales] Language with id "${id}" not found: File "${fetchName}" does not exist`)

		this.currentLanguage = deepMerge(clone(enLang), clone({ ...language }))

		this.currentLanuageId = id

		this.languageChanged.dispatch(id)
	}

	public static translate(key?: string, lang = this.currentLanguage) {
		if (!key) return ''

		if (key.startsWith('[') && key.endsWith(']')) {
			return key.slice(1, -1)
		}

		const parts = key.split('.')

		let current = lang
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

function clone(obj: any) {
	if (typeof window.structuredClone === 'function') return window.structuredClone(obj)

	return JSON.parse(JSON.stringify(obj))
}

export const useTranslate = createReactable(LocaleManager.languageChanged, () => (key: string) => LocaleManager.translate(key))
