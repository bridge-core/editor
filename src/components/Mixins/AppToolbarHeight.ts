// @ts-nocheck

export const AppToolbarHeightMixin = {
	computed: {
		appToolbarHeight() {
			return `env(titlebar-area-height, ${
				this.$vuetify.breakpoint.mobile ? 32 : 24
			}px)`
		},
	},
}
