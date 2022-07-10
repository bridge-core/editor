import { translate } from '/@/utils/locales'

export const TranslationMixin = {
	methods: {
		t(translationKey?: string) {
			return translate(translationKey)
		},
	},
}
