// @ts-nocheck

export const WindowControlsOverlayMixin = {
	data: () => ({
		windowControlsOverlay:
			navigator.windowControlsOverlay &&
			navigator.windowControlsOverlay.visible,
	}),
	mounted() {
		if (navigator.windowControlsOverlay) {
			navigator.windowControlsOverlay.addEventListener(
				'geometrychange',
				(event) => {
					this.windowControlsOverlay = event.visible
				}
			)
		}
	},
}
