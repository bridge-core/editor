// @ts-nocheck

import { WindowControlsOverlayMixin } from './WindowControlsOverlay'
import { isInFullScreen } from '/@/components/TabSystem/TabContextMenu/Fullscreen'

export const AppToolbarHeightMixin = {
	mixins: [WindowControlsOverlayMixin],
	computed: {
		appToolbarHeight() {
			if (isInFullScreen.value) return `0px`

			return `env(titlebar-area-height, ${
				this.$vuetify.breakpoint.mobile ? 0 : 24
			}px)`
		},
		appToolbarHeightNumber() {
			if (isInFullScreen.value) return 0
			if (this.windowControlsOverlay) return 33

			return this.$vuetify.breakpoint.mobile ? 0 : 24
		},
	},
}
