export const TranslationMixin = {
	methods: {
		t(translationKey?: string) {
			const orginalKey = translationKey
			if (!translationKey?.startsWith('$vuetify.'))
				translationKey = `$vuetify.${translationKey}`

			let translated: string
			try {
				translated = (<any>this).$vuetify.lang.t(translationKey)
			} catch {
				return orginalKey
			}

			if (translated === translationKey) return orginalKey
			return translated
		},
	},
}
