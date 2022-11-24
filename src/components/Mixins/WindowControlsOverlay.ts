// @ts-nocheck

export const WindowControlsOverlayMixin = {
	data: () => ({
		windowControlsOverlay:
			navigator.windowControlsOverlay &&
			navigator.windowControlsOverlay.visible,
	}),
	created() {
		if (import.meta.env.VITE_IS_TAURI_APP) {
			this.windowControlsOverlay = true
		} else if (navigator.windowControlsOverlay) {
			navigator.windowControlsOverlay.addEventListener(
				'geometrychange',
				(event) => {
					this.windowControlsOverlay = event.visible
				}
			)
		}
	},
}
