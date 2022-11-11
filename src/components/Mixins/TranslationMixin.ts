import { translate } from '../Locales/Manager'

export const TranslationMixin = {
	methods: {
		t(translationKey?: string) {
			return translate(translationKey)
		},
	},
}
