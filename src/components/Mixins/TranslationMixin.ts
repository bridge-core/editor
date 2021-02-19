export const TranslationMixin = {
	methods: {
		t(translationKey?: string) {
			const orginalKey = translationKey
			if (!translationKey?.startsWith('$vuetify.'))
				translationKey = `$vuetify.${translationKey}`

			const translated = (<any>this).$vuetify.lang.t(translationKey)
			if (translated === translationKey) return orginalKey
			return translated
		},
	},
}
