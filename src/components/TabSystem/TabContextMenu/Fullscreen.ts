import { ref } from 'vue'

export const isInFullScreen = ref(false)
let fullScreenElement: HTMLElement | null = null
export function setFullscreenElement(el: HTMLElement) {
	fullScreenElement = el
}
export function useFullScreen() {
	return {
		isInFullScreen,
	}
}

export const fullScreenAction = {
	icon: 'mdi-fullscreen',
	name: 'actions.fullscreen.name',
	description: 'actions.fullscreen.description',
	onTrigger: () => {
		if (!fullScreenElement) return

		if (document.fullscreenElement) {
			document.exitFullscreen()
		} else {
			fullScreenElement.requestFullscreen()

			isInFullScreen.value = true
			const onFullScreenChange = () => {
				isInFullScreen.value = document.fullscreenElement != null

				// If no longer in fullscreen, remove the event listener
				if (!isInFullScreen.value) {
					document.removeEventListener(
						'fullscreenchange',
						onFullScreenChange
					)
				}
			}
			// Listen for fullscreen cancel
			document.addEventListener('fullscreenchange', onFullScreenChange)
		}
	},
}
