import { onMounted, onUnmounted, Ref, ref } from 'vue'

/**
 * Reactive value if the user has a mobile sized screen
 * @returns A ref of wether the screen is a mobile size
 */
export function useIsMobile(): Ref<boolean> {
	const mobile = ref(false)
	update()

	function update() {
		mobile.value = document.body.clientWidth < 960
	}

	onMounted(() => {
		window.addEventListener('resize', update)
	})

	onUnmounted(() => {
		window.removeEventListener('resize', update)
	})

	return mobile
}
