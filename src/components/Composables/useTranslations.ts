import { LocaleManager } from '../Locales/Manager'

export function useTranslations() {
	return {
		t: (translationKey?: string) => LocaleManager.translate(translationKey),
	}
}
