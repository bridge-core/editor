// @ts-nocheck

import { WindowControlsOverlayMixin } from './WindowControlsOverlay'
import { isInFullScreen } from '/@/components/TabSystem/TabContextMenu/Fullscreen'
import { platform } from '/@/libs/os'

export const AppToolbarHeightMixin = {
	mixins: [WindowControlsOverlayMixin],
	data: () => ({
		toolbarPaddingLeft:
			import.meta.env.VITE_IS_TAURI_APP && platform() === 'darwin'
				? `70px`
				: `0px`,
	}),
	computed: {
		appToolbarHeight() {
			if (isInFullScreen.value) return `0px`
			if (import.meta.env.VITE_IS_TAURI_APP) return `28px`

			return `env(titlebar-area-height, ${
				this.$vuetify.breakpoint.mobile ? 0 : 24
			}px)`
		},
		appToolbarHeightNumber() {
			if (isInFullScreen.value) return 0
			if (import.meta.env.VITE_IS_TAURI_APP) return 28
			if (this.windowControlsOverlay) return 33

			return this.$vuetify.breakpoint.mobile ? 0 : 24
		},
	},
}
