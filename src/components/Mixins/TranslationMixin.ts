export const TranslationMixin = {
	methods: {
		t(translationKey?: string) {
			const orginalKey = translationKey
			if (orginalKey?.startsWith('[') && orginalKey.endsWith(']'))
				return orginalKey.slice(1, -1)

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
