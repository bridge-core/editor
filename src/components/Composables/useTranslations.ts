import { translate } from '/@/utils/locales'

export function useTranslations() {
	return {
		t: (translationKey?: string) => translate(translationKey),
	}
}
