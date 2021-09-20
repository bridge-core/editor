// @ts-nocheck

import { WindowControlsOverlayMixin } from './WindowControlsOverlay'

export const AppToolbarHeightMixin = {
	mixins: [WindowControlsOverlayMixin],
	computed: {
		appToolbarHeight() {
			return `env(titlebar-area-height, ${
				this.$vuetify.breakpoint.mobile ? 32 : 24
			}px)`
		},
		appToolbarHeightNumber() {
			if (this.windowControlsOverlay) return 33

			return this.$vuetify.breakpoint.mobile ? 32 : 24
		},
	},
}
